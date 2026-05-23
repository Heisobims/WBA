import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "allTime"; // allTime | weekly | monthly
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  let since: Date | undefined;
  if (period === "weekly") {
    since = new Date();
    since.setDate(since.getDate() - 7);
  } else if (period === "monthly") {
    since = new Date();
    since.setDate(since.getDate() - 30);
  }

  const entries = await db.leaderboardEntry.findMany({
    where: {
      period: period === "allTime" ? "ALL_TIME" : period === "weekly" ? "WEEKLY" : "MONTHLY",
    },
    take: limit,
    orderBy: { rank: "asc" },
    include: {
      user: {
        select: { id: true, name: true, image: true, level: true },
      },
    },
  });

  // If no cached entries, compute live
  if (entries.length === 0) {
    const users = await db.user.findMany({
      where: since ? { lastActiveAt: { gte: since } } : {},
      select: {
        id: true,
        name: true,
        image: true,
        xpPoints: true,
        level: true,
        totalResponses: true,
        avgQualityScore: true,
      },
      orderBy: { xpPoints: "desc" },
      take: limit,
    });

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      user: { id: u.id, name: u.name, image: u.image, level: u.level },
      xpPoints: u.xpPoints,
      totalResponses: u.totalResponses,
      avgQualityScore: u.avgQualityScore,
      isCurrentUser: u.id === session.user.id,
    }));

    const currentUserEntry = ranked.find((e) => e.isCurrentUser);

    return NextResponse.json({ success: true, data: ranked, currentUser: currentUserEntry });
  }

  const data = entries.map((e) => ({
    rank: e.rank,
    userId: e.userId,
    user: e.user,
    xpPoints: e.xpPoints,
    totalResponses: e.responses,
    isCurrentUser: e.userId === session.user.id,
  }));

  const currentUserEntry = data.find((e) => e.isCurrentUser);

  return NextResponse.json({ success: true, data, currentUser: currentUserEntry });
}
