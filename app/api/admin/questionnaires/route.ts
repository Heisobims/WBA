import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 25;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;

  const where: any = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [questionnaires, total] = await Promise.all([
    db.questionnaire.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { questions: true, responses: true } },
      },
    }),
    db.questionnaire.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: questionnaires, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const updated = await db.questionnaire.update({
    where: { id },
    data: { status },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      resource: "questionnaire",
      resourceId: id,
      newData: { status },
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
