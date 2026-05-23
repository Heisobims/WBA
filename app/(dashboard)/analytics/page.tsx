import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AnalyticsContent } from "./analytics-content";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [responseStats, questionnaires, recentResponses] = await Promise.all([
    db.response.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    db.questionnaire.findMany({
      where: { authorId: userId },
      select: {
        id: true, title: true, totalResponses: true,
        completionRate: true, avgQualityScore: true,
        avgCompletionTime: true, createdAt: true,
        _count: { select: { responses: true } },
      },
      orderBy: { totalResponses: "desc" },
      take: 10,
    }),
    db.response.findMany({
      where: { userId, status: "COMPLETED" },
      select: {
        id: true, qualityScore: true, timeSpentSeconds: true,
        startedAt: true, completedAt: true,
        questionnaire: { select: { title: true, xpReward: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
  ]);

  const totalCompleted = responseStats.find((s) => s.status === "COMPLETED")?._count._all || 0;
  const totalInProgress = responseStats.find((s) => s.status === "IN_PROGRESS")?._count._all || 0;
  const totalAbandoned = responseStats.find((s) => s.status === "ABANDONED")?._count._all || 0;

  const avgQuality =
    recentResponses.length > 0
      ? recentResponses.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / recentResponses.length
      : 0;

  return (
    <AnalyticsContent
      stats={{ totalCompleted, totalInProgress, totalAbandoned, avgQuality }}
      questionnaires={questionnaires}
      recentResponses={recentResponses}
    />
  );
}
