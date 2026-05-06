import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// GET all tasks for logged in user
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json(tasks);
}

// POST create new task
export async function POST(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { title, subject, deadline, priority } = await req.json();

  if (!title || !subject || !deadline || !priority) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      subject,
      deadline: new Date(deadline),
      priority,
      userId: user.id,
    },
  });

  return NextResponse.json(task, { status: 201 });
}