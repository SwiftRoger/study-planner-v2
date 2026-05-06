import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { subject, deadline, priority } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a study planner assistant. A student needs help breaking down their study task.

Subject: ${subject}
Deadline: ${deadline}
Priority: ${priority}

Give exactly 4 specific subtask suggestions to help them prepare.
Respond ONLY with a JSON array like this:
["subtask 1", "subtask 2", "subtask 3", "subtask 4"]
No explanation, no markdown, just the JSON array.`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(clean);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}