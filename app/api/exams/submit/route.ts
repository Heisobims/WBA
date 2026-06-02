import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { examId, answers, score, timeSpent } = body;

    if (!examId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Clamp score to 0-100 — never trust raw client value
    const safeScore = Math.min(100, Math.max(0, Number(score) || 0));

    // Look up DB exam (may not exist if using static data)
    const exam = await db.qualificationExam.findFirst({
      where: { OR: [{ id: examId }, { title: { contains: examId } }] },
    }).catch(() => null);

    // Calculate passed server-side from DB passingScore
    const serverPassed = safeScore >= (exam?.passingScore ?? 70);

    let attempt;
    if (exam) {
      attempt = await db.examAttempt.create({
        data: {
          userId: session.user.id,
          examId: exam.id,
          score: safeScore,
          passed: serverPassed,
          timeSpent: timeSpent ?? 0,
          status: "COMPLETED",
          answers: answers ? JSON.parse(JSON.stringify(answers)) : {},
          completedAt: new Date(),
        },
      });
    }

    // Award XP based on server-calculated result
    const xpEarned = serverPassed ? 100 : 25;
    await db.user.update({
      where: { id: session.user.id },
      data: { xpPoints: { increment: xpEarned } },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt?.id,
      xpEarned,
    });
  } catch (err) {
    console.error("Exam submit error:", err);
    return NextResponse.json({ error: "Failed to save exam attempt" }, { status: 500 });
  }
}
