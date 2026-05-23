import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [allAchievements, userAchievements] = await Promise.all([
      db.achievement.findMany({ orderBy: [{ category: "asc" }, { xpReward: "asc" }] }),
      db.userAchievement.findMany({
        where: { userId: session.user.id },
        select: { achievementId: true, unlockedAt: true },
      }),
    ]);

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));
    const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

    const achievements = allAchievements.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earnedMap.get(a.id) ?? null,
    }));

    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    console.error("[achievements GET]", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
