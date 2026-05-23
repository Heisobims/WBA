import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitResponseSchema } from "@/lib/validations";
import { scoreResponse } from "@/lib/ai";
import { calculateLevel } from "@/lib/utils";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = submitResponseSchema.parse(body);

    // Get questionnaire details
    const questionnaire = await db.questionnaire.findUnique({
      where: { id: data.questionnaireId },
      include: { questions: true },
    });

    if (!questionnaire) {
      return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });
    }

    // Create response
    const response = await db.response.create({
      data: {
        questionnaireId: data.questionnaireId,
        userId: session.user.id,
        status: "COMPLETED",
        completedAt: new Date(),
        timeSpentSeconds: data.timeSpentSeconds,
        totalQuestions: questionnaire.questions.length,
        currentQuestionIndex: questionnaire.questions.length,
      },
    });

    // Create answers
    if (data.answers.length > 0) {
      await db.answer.createMany({
        data: data.answers.map((answer) => ({
          responseId: response.id,
          questionId: answer.questionId,
          textValue: answer.textValue,
          numericValue: answer.numericValue,
          booleanValue: answer.booleanValue,
          arrayValue: answer.arrayValue || [],
          jsonValue: answer.jsonValue,
          fileUrls: answer.fileUrls || [],
          mediaUrl: answer.mediaUrl,
          codeValue: answer.codeValue,
          codeLanguage: answer.codeLanguage,
          timeSpentSeconds: answer.timeSpentSeconds,
        })),
      });
    }

    // AI scoring (async, non-blocking)
    let qualityScore = 70; // default
    let aiEvaluationId: string | null = null;

    if (questionnaire.aiEnabled) {
      try {
        const textAnswers = data.answers
          .filter((a) => a.textValue && a.textValue.length > 20)
          .slice(0, 3);

        if (textAnswers.length > 0) {
          const question = questionnaire.questions.find(
            (q) => q.id === textAnswers[0].questionId,
          );

          if (question) {
            const scoring = await scoreResponse({
              questionTitle: question.title,
              questionType: question.type,
              response: textAnswers[0].textValue!,
            });

            qualityScore = scoring.qualityScore;

            const evaluation = await db.aIEvaluation.create({
              data: {
                responseId: response.id,
                status: "COMPLETED",
                overallScore: scoring.score,
                toxicityScore: scoring.toxicity,
                summary: scoring.summary,
                strengths: scoring.strengths,
                weaknesses: scoring.weaknesses,
                tags: scoring.tags,
                modelUsed: process.env.OPENAI_MODEL || "gpt-4o",
              },
            });
            aiEvaluationId = evaluation.id;
          }
        }

        await db.response.update({
          where: { id: response.id },
          data: { qualityScore },
        });
      } catch (aiError) {
        console.error("[AI scoring error]", aiError);
      }
    }

    // Award XP
    const xpEarned = questionnaire.xpReward;
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { xpPoints: true, level: true, totalResponses: true, streakDays: true, streakLastDate: true },
    });

    if (currentUser) {
      const newXP = currentUser.xpPoints + xpEarned;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > currentUser.level;

      // Update streak
      const today = new Date().toDateString();
      const lastDate = currentUser.streakLastDate?.toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = currentUser.streakDays;
      if (lastDate !== today) {
        newStreak = lastDate === yesterday ? currentUser.streakDays + 1 : 1;
      }

      await db.user.update({
        where: { id: session.user.id },
        data: {
          xpPoints: newXP,
          level: newLevel,
          totalResponses: currentUser.totalResponses + 1,
          streakDays: newStreak,
          streakLastDate: new Date(),
          lastActiveAt: new Date(),
        },
      });

      // Update questionnaire stats
      await db.questionnaire.update({
        where: { id: data.questionnaireId },
        data: {
          totalResponses: { increment: 1 },
          avgQualityScore: qualityScore,
        },
      });

      // Create notification for XP
      await db.notification.create({
        data: {
          userId: session.user.id,
          type: "ACHIEVEMENT",
          title: `+${xpEarned} XP Earned!`,
          body: `You completed "${questionnaire.title}" and earned ${xpEarned} XP.`,
          data: { xpAmount: xpEarned, questionnaireId: questionnaire.id },
        },
      });

      if (leveledUp) {
        await db.notification.create({
          data: {
            userId: session.user.id,
            type: "LEVEL_UP",
            title: `Level Up! You're now Level ${newLevel}!`,
            body: `Congratulations on reaching Level ${newLevel}!`,
            data: { levelUp: newLevel },
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          responseId: response.id,
          xpEarned,
          qualityScore,
          newLevel: leveledUp ? newLevel : undefined,
          totalXP: newXP,
        },
      });
    }

    return NextResponse.json({ success: true, data: { responseId: response.id, xpEarned } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[POST /api/responses]", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const questionnaireId = searchParams.get("questionnaireId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where = {
      userId: session.user.id,
      ...(questionnaireId && { questionnaireId }),
    };

    const [responses, total] = await Promise.all([
      db.response.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startedAt: "desc" },
        include: {
          questionnaire: { select: { id: true, title: true, xpReward: true } },
          aiEvaluation: { select: { overallScore: true } },
        },
      }),
      db.response.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: responses, total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
  }
}
