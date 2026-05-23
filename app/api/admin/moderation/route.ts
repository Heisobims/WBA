import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "REVIEWER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  // Flagged responses: those with toxicity detected or manually flagged
  const [flagged, total] = await Promise.all([
    db.response.findMany({
      where: { status: "FLAGGED" },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        questionnaire: { select: { id: true, title: true } },
        answers: {
          take: 3,
          select: { id: true, textValue: true, question: { select: { title: true } } },
        },
      },
    }),
    db.response.count({ where: { status: "FLAGGED" } }),
  ]);

  return NextResponse.json({ success: true, data: flagged, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "REVIEWER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { responseId, action } = await req.json();
  if (!responseId || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const status = action === "APPROVE" ? "COMPLETED" : "REJECTED";

  const updated = await db.response.update({
    where: { id: responseId },
    data: { status },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: action === "APPROVE" ? "APPROVE" : "REJECT",
      resource: "response",
      resourceId: responseId,
      newData: { status },
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
