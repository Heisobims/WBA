import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;

  try {
    const track = await db.trainingTrack.findUnique({ where: { slug } });
    if (!track) return NextResponse.json({ masteryLevel: 0 });

    const progress = await db.userTrackProgress.findUnique({
      where: { userId_trackId: { userId: session.user.id, trackId: track.id } },
    });

    return NextResponse.json(progress ?? { masteryLevel: 0, tasksCompleted: 0, avgScore: 0 });
  } catch {
    return NextResponse.json({ masteryLevel: 0 });
  }
}
