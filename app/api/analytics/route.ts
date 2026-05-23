import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";

  const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);

  if (isAdmin) {
    const [totalUsers, totalQuestionnaires, totalResponses, recentResponses, topQuestionnaires] =
      await Promise.all([
        db.user.count(),
        db.questionnaire.count(),
        db.response.count(),
        db.response.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true, qualityScore: true },
          orderBy: { createdAt: "asc" },
        }),
        db.questionnaire.findMany({
          take: 5,
          orderBy: { totalResponses: "desc" },
          select: { id: true, title: true, totalResponses: true, avgQualityScore: true },
        }),
      ]);

    const dailyData = buildDailyData(recentResponses, days);

    return NextResponse.json({
      success: true,
      data: {
        overview: { totalUsers, totalQuestionnaires, totalResponses },
        dailyData,
        topQuestionnaires,
      },
    });
  }

  // Per-user analytics
  const [myQuestionnaires, myResponses] = await Promise.all([
    db.questionnaire.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        totalResponses: true,
        avgQualityScore: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.response.findMany({
      where: { userId: session.user.id, createdAt: { gte: since } },
      select: { createdAt: true, qualityScore: true, timeSpentSeconds: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const dailyData = buildDailyData(myResponses, days);
  const avgQuality =
    myResponses.length > 0
      ? Math.round(
          myResponses.reduce((s, r) => s + (r.qualityScore || 0), 0) / myResponses.length,
        )
      : 0;

  return NextResponse.json({
    success: true,
    data: {
      overview: {
        totalQuestionnaires: myQuestionnaires.length,
        totalResponses: myResponses.length,
        avgQualityScore: avgQuality,
      },
      dailyData,
      questionnaires: myQuestionnaires,
    },
  });
}

function buildDailyData(
  responses: { createdAt: Date; qualityScore: number | null }[],
  days: number,
) {
  const map: Record<string, { count: number; totalQuality: number }> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    map[key] = { count: 0, totalQuality: 0 };
  }

  for (const r of responses) {
    const key = r.createdAt.toISOString().split("T")[0];
    if (map[key]) {
      map[key].count++;
      map[key].totalQuality += r.qualityScore || 0;
    }
  }

  return Object.entries(map).map(([date, { count, totalQuality }]) => ({
    date,
    responses: count,
    avgQuality: count > 0 ? Math.round(totalQuality / count) : 0,
  }));
}
