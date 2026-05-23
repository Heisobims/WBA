import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [user, recentResponses, recentQuestionnaires, achievements] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true,
        xpPoints: true, level: true, streakDays: true,
        totalResponses: true, completedQuestionnaires: true,
        avgQualityScore: true, onboardingCompleted: true,
        createdAt: true,
      },
    }),
    db.response.findMany({
      where: { userId },
      take: 5,
      orderBy: { startedAt: "desc" },
      include: {
        questionnaire: { select: { id: true, title: true, category: true } },
      },
    }),
    db.questionnaire.findMany({
      where: { authorId: userId },
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { responses: true, questions: true } } },
    }),
    db.userAchievement.findMany({
      where: { userId },
      take: 3,
      orderBy: { unlockedAt: "desc" },
      include: { achievement: true },
    }),
  ]);

  if (!user) redirect("/login");

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent
        user={user}
        recentResponses={recentResponses}
        recentQuestionnaires={recentQuestionnaires}
        achievements={achievements}
      />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
