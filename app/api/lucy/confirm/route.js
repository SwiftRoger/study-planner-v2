import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDeadline } from "@/lib/lucy";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function POST(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, subject, deadline, priority, notes } = await req.json();

    if (!title || !subject) {
      return NextResponse.json({ message: "Title and subject are required" }, { status: 400 });
    }

    const normalizedDeadline = normalizeDeadline(deadline);
    const validPriority = ["high", "medium", "low"].includes(priority) ? priority : "medium";

    const taskData = {
      title: String(title),
      subject: String(subject),
      deadline: normalizedDeadline
        ? new Date(normalizedDeadline)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: validPriority,
      status: "pending",
      userId: user.id,
    };

    // Only add notes if it exists
    if (notes && String(notes).trim()) {
      taskData.notes = String(notes).trim();
    }

    const task = await prisma.task.create({ data: taskData });

    return NextResponse.json({ task });
  } catch (err) {
    console.error("Confirm task error:", err.message);
    return NextResponse.json({ message: "Failed to save task" }, { status: 500 });
  }
}