import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { taskId, answer, score, timeSpent } = body;

    if (!taskId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Clamp score server-side — never trust raw client value
    const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
    const serverCorrect = safeScore >= 70;
    const xpEarned = Math.min(50, Math.round(safeScore / 2));

    // Find task in DB (may not exist if using static data)
    const task = await db.practiceTask.findUnique({ where: { id: taskId } }).catch(() => null);

    let attempt;
    if (task) {
      attempt = await db.taskAttempt.create({
        data: {
          userId: session.user.id,
          taskId: task.id,
          answer: answer ? JSON.parse(JSON.stringify(answer)) : {},
          score: safeScore,
          timeSpent: timeSpent ?? 0,
          isCorrect: serverCorrect,
        },
      });

      // Update track progress
      const existing = await db.userTrackProgress.findUnique({
        where: { userId_trackId: { userId: session.user.id, trackId: task.trackId } },
      });

      const tasksCompleted = (existing?.tasksCompleted ?? 0) + 1;
      const avgScore = existing
        ? ((existing.avgScore ?? 0) * (tasksCompleted - 1) + score) / tasksCompleted
        : score;
      const masteryLevel = Math.min(5, Math.floor(tasksCompleted / 5));

      await db.userTrackProgress.upsert({
        where: { userId_trackId: { userId: session.user.id, trackId: task.trackId } },
        create: {
          userId: session.user.id,
          trackId: task.trackId,
          tasksCompleted,
          avgScore,
          masteryLevel,
          lastPracticed: new Date(),
        },
        update: {
          tasksCompleted,
          avgScore,
          masteryLevel,
          lastPracticed: new Date(),
        },
      });

      // Update task stats
      await db.practiceTask.update({
        where: { id: task.id },
        data: {
          totalAttempts: { increment: 1 },
          avgScore: avgScore,
        },
      }).catch(() => null);
    }

    // Award XP to user
    if (xpEarned && xpEarned > 0) {
      await db.user.update({
        where: { id: session.user.id },
        data: { xpPoints: { increment: xpEarned } },
      });
    }

    return NextResponse.json({ success: true, attemptId: attempt?.id });
  } catch (err) {
    console.error("Practice submit error:", err);
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }
}
