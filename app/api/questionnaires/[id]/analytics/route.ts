import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const questionnaire = await db.questionnaire.findUnique({
    where: { id },
    select: { authorId: true, title: true, totalResponses: true, avgQualityScore: true },
  });

  if (!questionnaire) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = questionnaire.authorId === session.user.id;
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [responses, questionStats] = await Promise.all([
    db.response.findMany({
      where: { questionnaireId: id, status: "COMPLETED" },
      select: {
        qualityScore: true,
        timeSpentSeconds: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.question.findMany({
      where: { questionnaireId: id },
      select: {
        id: true,
        title: true,
        type: true,
        _count: { select: { answers: true } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  const qualityBuckets = { excellent: 0, good: 0, fair: 0, poor: 0 };
  let totalTime = 0;
  let timedCount = 0;

  for (const r of responses) {
    const q = r.qualityScore || 0;
    if (q >= 80) qualityBuckets.excellent++;
    else if (q >= 60) qualityBuckets.good++;
    else if (q >= 40) qualityBuckets.fair++;
    else qualityBuckets.poor++;

    if (r.timeSpentSeconds) {
      totalTime += r.timeSpentSeconds;
      timedCount++;
    }
  }

  const avgCompletionTime = timedCount > 0 ? Math.round(totalTime / timedCount) : 0;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recentResponses = responses.filter((r) => r.createdAt >= since);

  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().split("T")[0]] = 0;
  }
  for (const r of recentResponses) {
    const key = r.createdAt.toISOString().split("T")[0];
    if (dailyMap[key] !== undefined) dailyMap[key]++;
  }

  const dailyVolume = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    success: true,
    data: {
      overview: {
        totalResponses: questionnaire.totalResponses,
        avgQualityScore: questionnaire.avgQualityScore,
        avgCompletionTime,
        completionRate: responses.length > 0 ? 100 : 0,
      },
      qualityDistribution: qualityBuckets,
      dailyVolume,
      questionStats: questionStats.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        answerCount: q._count.answers,
      })),
    },
  });
}
