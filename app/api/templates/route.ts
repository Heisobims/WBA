import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;

  const templates = await db.questionTemplate.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      category: true,
      type: true,
      description: true,
      content: true,
      useCount: true,
    },
  });

  return NextResponse.json({ success: true, data: templates });
}
