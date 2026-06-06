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

    const { type = "chat", messages = [], language = "en", hours = 4 } = await req.json();

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

      const pending6 = pending.slice(0, 6);
      const taskList = pending6.map(t => {
        const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return `ID:${t.id}|${t.title}|${t.subject}|${t.priority}|${daysLeft}d left`;
      }).join("\n");

      // Ask for FLAT array of tasks — much simpler for the model, we build days ourselves
      const planPrompt = `You are Lucy, an AI study planner.
Today: ${new Date().toDateString()}. Hours per day: ${hours}.
Language for tips: ${language === "kh" ? "Khmer" : "English"}.

Tasks to schedule:
${taskList}

Return ONLY a flat JSON array of task objects. No nesting, no day grouping, just tasks in priority order.
Each object has: id, title, subject, priority, allocatedHours, daysLeft, tip (max 8 words), dayNumber (which study day, starting from 1, max ${hours}hrs per day).

Example: [{"id":1,"title":"Math","subject":"Math","priority":"high","allocatedHours":2,"daysLeft":5,"tip":"Review formulas first","dayNumber":1}]

ONLY return the JSON array. No markdown. No explanation.`;

      const raw = await callGroq(
        [{ role: "user", content: "Generate the flat task schedule JSON now." }],
        planPrompt,
        1000
      );

      try {
        let cleaned = raw.replace(/```json|```/g, "").trim();
        const arrayMatch = cleaned.match(/\[[\s\S]*?\]/s);
        if (arrayMatch) cleaned = arrayMatch[0];

        const flatTasks = JSON.parse(cleaned);

        // Group flat tasks into days ourselves — reliable and clean
        const dayMap = {};
        const today = new Date();

        for (const task of flatTasks) {
          const dayNum = task.dayNumber || 1;
          if (!dayMap[dayNum]) {
            const d = new Date(today);
            d.setDate(d.getDate() + dayNum - 1);
            dayMap[dayNum] = {
              day: dayNum,
              date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              tasks: [],
            };
          }
          dayMap[dayNum].tasks.push({
            id: task.id,
            title: task.title,
            subject: task.subject,
            priority: task.priority,
            allocatedHours: task.allocatedHours || 1,
            daysLeft: task.daysLeft || 0,
            tip: task.tip || "",
          });
        }

        const plan = Object.values(dayMap).sort((a, b) => a.day - b.day);
        return NextResponse.json({ plan });

      } catch (e) {
        console.error("Plan parse error:", e.message, "| raw:", raw.slice(0, 300));
        return NextResponse.json({ plan: [], message: "Could not generate plan, please try again." });
      }
    }

    // ── CHAT ─────────────────────────────────────────────────
    if (type === "chat") {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const userTypedKhmer = detectKhmer(lastMessage);
      const effectiveLang = userTypedKhmer ? "kh" : "en";

      // ── Detect task actions from message ─────────────────
      const completeKeywords = /\b(finish|finished|done|completed|complete|submitted|turned in|handed in|pass|passed|បាន|រួច|ចប់|សម្រេច|បញ្ចប់)\b/i;
      const cancelKeywords = /\b(cancel|cancelled|canceled|delete|remove|drop|skip|postpone|reschedule|sick|called off|not happening|លុប|បោះបង់|លែង)\b/i;

      let completedTask = null;
      let cancelledTask = null;

      // Fuzzy match: check if any word from task title appears in message
      function fuzzyMatch(message, taskTitle) {
        const msgLower = message.toLowerCase();
        const titleWords = taskTitle.toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 3); // skip short words like "with", "the"
        // Match if ANY significant word from title is in message
        return titleWords.some(word => msgLower.includes(word));
      }

      const lowerMsg = lastMessage.toLowerCase();

      if (completeKeywords.test(lastMessage)) {
        const matchedTask = tasks.find(t =>
          t.status === "pending" && fuzzyMatch(lastMessage, t.title)
        );
        if (matchedTask) {
          await prisma.task.update({
            where: { id: matchedTask.id },
            data: { status: "completed" },
          });
          completedTask = { id: matchedTask.id, title: matchedTask.title };
        }
      }

      if (cancelKeywords.test(lastMessage)) {
        const matchedTask = tasks.find(t =>
          t.status === "pending" && fuzzyMatch(lastMessage, t.title)
        );
        if (matchedTask && !completedTask) {
          await prisma.task.delete({ where: { id: matchedTask.id } });
          cancelledTask = { id: matchedTask.id, title: matchedTask.title };
        }
      }

      const taskContext = buildTaskContext(tasks);
      const basePrompt = buildSystemPrompt(effectiveLang, taskContext);
      const langEnforcement = effectiveLang === "en"
        ? `\n\nCRITICAL: User wrote in ENGLISH. Reply in ENGLISH ONLY. No Khmer script whatsoever.`
        : `\n\nបង្គាប់: ឆ្លើយជាភាសាខ្មែរទាំងស្រុង។`;

      // Tell Lucy what actually happened
      const completionContext = completedTask
        ? `\n\nSYSTEM: Task "${completedTask.title}" has been marked COMPLETED in the database. Celebrate with the student!`
        : cancelledTask
        ? `\n\nSYSTEM: Task "${cancelledTask.title}" has been DELETED from the database. Acknowledge this and move on.`
        : "";

      const rawReply = await callGroq(
        messages.slice(-10),
        basePrompt + langEnforcement + completionContext,
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
        pendingTask,
        completedTask,
        cancelledTask,        // frontend shows red toast
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