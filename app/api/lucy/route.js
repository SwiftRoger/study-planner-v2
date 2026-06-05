import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildSystemPrompt,
  buildBriefingPrompt,
  buildTaskContext,
  parseTaskFromResponse,
  cleanResponseText,
  normalizeDeadline,
  detectKhmer,
} from "@/lib/lucy";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

async function callGroq(messages, systemPrompt, maxTokens = 400) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.75,
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { type = "chat", messages = [], language = "en" } = await req.json();

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { deadline: "asc" },
    });

    // ── BRIEFING ─────────────────────────────────────────────
    if (type === "briefing") {
      const prompt = buildBriefingPrompt(language, tasks, user.name);
      const reply = await callGroq(
        [{ role: "user", content: "Generate my morning briefing." }],
        prompt, 300
      );
      return NextResponse.json({ reply });
    }

    // ── STUDY PLAN ───────────────────────────────────────────
    if (type === "plan") {
      const pending = tasks.filter(t => t.status === "pending");
      if (pending.length === 0) {
        return NextResponse.json({
          plan: [],
          message: language === "kh" ? "មិនមានកិច្ចការជំពោះទេ!" : "No pending tasks! Add some tasks first.",
        });
      }

      const taskList = pending.map(t =>
        `- ID:${t.id} | ${t.title} | ${t.subject} | ${t.priority} priority | deadline: ${new Date(t.deadline).toDateString()}`
      ).join("\n");

      const planPrompt = `You are Lucy, a strict but caring AI study planner.
Create a day-by-day study schedule. Available hours per day: 4.
Today: ${new Date().toDateString()}.
Respond in ${language === "kh" ? "Khmer" : "English only"}.
Return ONLY valid JSON array, no markdown:
[{"day":1,"date":"Mon Jun 9","tasks":[{"id":1,"title":"...","subject":"...","priority":"high","allocatedHours":2,"daysLeft":5,"tip":"..."}]}]
Rules: high priority first, high=2-3hrs, medium=1-2hrs, low=1hr, max 4hrs/day, add a specific tip per task.`;

      const raw = await callGroq(
        [{ role: "user", content: `Create study plan:\n${taskList}` }],
        planPrompt, 800
      );

      try {
        const plan = JSON.parse(raw.replace(/```json|```/g, "").trim());
        return NextResponse.json({ plan });
      } catch {
        return NextResponse.json({ plan: [], message: "Could not generate plan, please try again." });
      }
    }

    // ── CHAT ─────────────────────────────────────────────────
    if (type === "chat") {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const userTypedKhmer = detectKhmer(lastMessage);
      const effectiveLang = userTypedKhmer ? "kh" : "en";

      const taskContext = buildTaskContext(tasks);
      const basePrompt = buildSystemPrompt(effectiveLang, taskContext);
      const langEnforcement = effectiveLang === "en"
        ? `\n\nCRITICAL: User wrote in ENGLISH. Reply in ENGLISH ONLY. No Khmer script whatsoever.`
        : `\n\nបង្គាប់: ឆ្លើយជាភាសាខ្មែរទាំងស្រុង។`;

      const rawReply = await callGroq(
        messages.slice(-10),
        basePrompt + langEnforcement,
        400
      );

      // Parse task data but DON'T save yet — return as pendingTask for confirmation
      const taskData = parseTaskFromResponse(rawReply);
      const cleanReply = cleanResponseText(rawReply);

      let pendingTask = null;
      if (taskData && taskData.title && taskData.subject) {
        const deadline = normalizeDeadline(taskData.deadline);
        pendingTask = {
          title: taskData.title,
          subject: taskData.subject,
          deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: ["high", "medium", "low"].includes(taskData.priority) ? taskData.priority : "medium",
          notes: taskData.notes || "",
        };
      }

      return NextResponse.json({
        reply: cleanReply,
        pendingTask,          // frontend shows confirmation card
        language: effectiveLang,
      });
    }

    return NextResponse.json({ message: "Invalid request type" }, { status: 400 });

  } catch (err) {
    console.error("Lucy API error:", err);
    return NextResponse.json({ message: "Lucy is taking a short break. Please try again!" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language") || "en";

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { deadline: "asc" },
    });

    const prompt = buildBriefingPrompt(language, tasks, user.name);
    const reply = await callGroq(
      [{ role: "user", content: "Generate my morning briefing now." }],
      prompt, 300
    );

    return NextResponse.json({ reply, taskCount: tasks.length });
  } catch (err) {
    console.error("Lucy briefing error:", err);
    return NextResponse.json({ reply: "Good morning! Let's have a productive day. 💙" });
  }
}