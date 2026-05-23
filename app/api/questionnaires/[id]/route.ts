import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateQuestionnaireSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    const questionnaire = await db.questionnaire.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        author: { select: { id: true, name: true, image: true, email: true } },
        _count: { select: { responses: true, questions: true } },
      },
    });

    if (!questionnaire) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = session?.user.id === questionnaire.authorId;
    const isAdmin = session?.user.role && ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);

    if (!questionnaire.isPublic && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: questionnaire });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const questionnaire = await db.questionnaire.findUnique({
      where: { id },
      select: { authorId: true, status: true },
    });

    if (!questionnaire) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = session.user.id === questionnaire.authorId;
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const data = updateQuestionnaireSchema.parse(body);

    const updated = await db.questionnaire.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.tags && { tags: data.tags }),
        ...(data.status && { status: data.status as any }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.requireAuth !== undefined && { requireAuth: data.requireAuth }),
        ...(data.randomizeOrder !== undefined && { randomizeOrder: data.randomizeOrder }),
        ...(data.showProgress !== undefined && { showProgress: data.showProgress }),
        ...(data.allowResume !== undefined && { allowResume: data.allowResume }),
        ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit }),
        ...(data.estimatedTime !== undefined && { estimatedTime: data.estimatedTime }),
        ...(data.maxAttempts !== undefined && { maxAttempts: data.maxAttempts }),
        ...(data.aiEnabled !== undefined && { aiEnabled: data.aiEnabled }),
        ...(data.adaptiveEnabled !== undefined && { adaptiveEnabled: data.adaptiveEnabled }),
        ...(data.xpReward !== undefined && { xpReward: data.xpReward }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.status === "PUBLISHED" && questionnaire.status !== "PUBLISHED" && { publishedAt: new Date() }),
      },
    });

    if (data.questions) {
      await db.question.deleteMany({ where: { questionnaireId: id } });
      if (data.questions.length > 0) {
        await db.question.createMany({
          data: data.questions.map((q, index) => ({
            questionnaireId: id,
            type: q.type as any,
            title: q.title,
            description: q.description,
            isRequired: q.isRequired,
            options: q.options || [],
            scoringEnabled: q.scoringEnabled,
            aiFollowUp: q.aiFollowUp,
            branchingRules: q.branchingRules || [],
            tags: q.tags || [],
            order: index,
            timeLimit: q.timeLimit,
            minValue: q.minValue,
            maxValue: q.maxValue,
            codeLanguage: q.codeLanguage,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[PUT /api/questionnaires/[id]]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const questionnaire = await db.questionnaire.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!questionnaire) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = session.user.id === questionnaire.authorId;
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await db.questionnaire.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
