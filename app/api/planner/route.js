import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStudyPlan } from "@/lib/planner";

export async function GET(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const hours = parseFloat(searchParams.get("hours") || "4");

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { deadline: "asc" },
  });

  const plan = generateStudyPlan(tasks, hours);

  return NextResponse.json(plan);
}