import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { subject, deadline, priority } = await req.json();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `You are a study planner assistant. A student needs help breaking down their study task.

Subject: ${subject}
Deadline: ${deadline}
Priority: ${priority}

Give exactly 4 specific subtask suggestions to help them prepare.
Respond ONLY with a JSON array like this:
["subtask 1", "subtask 2", "subtask 3", "subtask 4"]
No explanation, no markdown, just the JSON array.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "[]";
console.log("Groq response:", JSON.stringify(data));
console.log("Extracted text:", text);
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(clean);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}