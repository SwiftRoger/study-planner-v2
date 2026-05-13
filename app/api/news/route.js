import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "technology";

  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}