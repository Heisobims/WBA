import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interests, skillLevel, goals } = await req.json();

  await db.$transaction(async (tx) => {
    // Mark onboarding complete and award welcome bonus XP
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        xpPoints: { increment: 50 },
      },
    });

    // Upsert interests
    if (interests?.length) {
      await tx.userInterest.deleteMany({ where: { userId: session.user.id } });
      await tx.userInterest.createMany({
        data: interests.map((category: string) => ({
          userId: session.user.id,
          category,
        })),
        skipDuplicates: true,
      });
    }

    // Upsert skill
    if (skillLevel) {
      await tx.userSkill.upsert({
        where: { userId_skill: { userId: session.user.id, skill: "AI/ML" } },
        create: { userId: session.user.id, skill: "AI/ML", level: parseInt(skillLevel) },
        update: { level: parseInt(skillLevel) },
      });
    }

    // Welcome notification
    await tx.notification.create({
      data: {
        userId: session.user.id,
        type: "REWARD",
        title: "Welcome to WBAcademy!",
        body: "You've been awarded 50 XP as a welcome bonus. Start completing questionnaires to earn more!",
      },
    });
  });

  return NextResponse.json({ success: true });
}
