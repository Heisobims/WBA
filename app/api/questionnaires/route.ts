import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createQuestionnaireSchema } from "@/lib/validations";
import { generateUniqueSlug } from "@/lib/utils";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const mine = searchParams.get("mine") === "true";

    const where = {
      ...(mine && session ? { authorId: session.user.id } : { isPublic: true }),
      ...(status && { status: status as any }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [questionnaires, total] = await Promise.all([
      db.questionnaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { responses: true, questions: true } },
        },
      }),
      db.questionnaire.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: questionnaires,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/questionnaires]", error);
    return NextResponse.json({ error: "Failed to fetch questionnaires" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createQuestionnaireSchema.parse(body);

    const slug = generateUniqueSlug(data.title);

    const questionnaire = await db.questionnaire.create({
      data: {
        title: data.title,
        description: data.description,
        slug,
        category: data.category,
        tags: data.tags || [],
        status: data.status || "DRAFT",
        isPublic: data.isPublic,
        requireAuth: data.requireAuth,
        randomizeOrder: data.randomizeOrder,
        showProgress: data.showProgress,
        allowResume: data.allowResume,
        timeLimit: data.timeLimit,
        estimatedTime: data.estimatedTime,
        maxAttempts: data.maxAttempts,
        aiEnabled: data.aiEnabled,
        adaptiveEnabled: data.adaptiveEnabled,
        xpReward: data.xpReward,
        difficulty: data.difficulty,
        authorId: session.user.id,
        ...(data.status === "PUBLISHED" && { publishedAt: new Date() }),
      },
    });

    // Create questions
    if (data.questions?.length > 0) {
      await db.question.createMany({
        data: data.questions.map((q, index) => ({
          questionnaireId: questionnaire.id,
          type: q.type as any,
          title: q.title,
          description: q.description,
          placeholder: q.placeholder,
          helperText: q.helperText,
          imageUrl: q.imageUrl,
          videoUrl: q.videoUrl,
          audioUrl: q.audioUrl,
          codeSnippet: q.codeSnippet,
          codeLanguage: q.codeLanguage,
          isRequired: q.isRequired,
          allowMultiple: q.allowMultiple,
          timeLimit: q.timeLimit,
          minLength: q.minLength,
          maxLength: q.maxLength,
          minValue: q.minValue,
          maxValue: q.maxValue,
          options: q.options || [],
          scoringEnabled: q.scoringEnabled,
          maxScore: q.maxScore,
          aiFollowUp: q.aiFollowUp,
          branchingRules: q.branchingRules || [],
          tags: q.tags || [],
          order: index,
        })),
      });
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "questionnaire",
        resourceId: questionnaire.id,
        newData: { title: data.title },
      },
    });

    return NextResponse.json({ success: true, data: questionnaire }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("[POST /api/questionnaires]", error);
    return NextResponse.json({ error: "Failed to create questionnaire" }, { status: 500 });
  }
}
