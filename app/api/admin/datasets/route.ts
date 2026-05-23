import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "AI_TRAINER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const [datasets, total] = await Promise.all([
    db.dataset.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true } },
      },
    }),
    db.dataset.count(),
  ]);

  return NextResponse.json({ success: true, data: datasets, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "AI_TRAINER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, description, questionnaireId } = await req.json();
  if (!name || !questionnaireId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const totalEntries = await db.response.count({
    where: { questionnaireId, status: "COMPLETED" },
  });

  const dataset = await db.dataset.create({
    data: {
      name,
      description,
      ownerId: session.user.id,
      questionnaireId,
      status: "COLLECTING",
      totalEntries,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      resource: "dataset",
      resourceId: dataset.id,
      newData: { name, questionnaireId },
    },
  });

  return NextResponse.json({ success: true, data: dataset }, { status: 201 });
}
