import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true,
        role: true, status: true, plan: true,
        bio: true, location: true, website: true,
        timezone: true, language: true,
        xpPoints: true, level: true, streakDays: true,
        totalResponses: true, completedQuestionnaires: true,
        avgQualityScore: true, onboardingCompleted: true,
        notificationsEnabled: true, emailNotifications: true,
        createdAt: true, lastActiveAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[users/me GET]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[users/me DELETE]", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Allow notification settings to be patched without full profile validation
    if ("notificationsEnabled" in body || "emailNotifications" in body) {
      const updated = await db.user.update({
        where: { id: session.user.id },
        data: {
          ...(typeof body.notificationsEnabled === "boolean" && { notificationsEnabled: body.notificationsEnabled }),
          ...(typeof body.emailNotifications === "boolean" && { emailNotifications: body.emailNotifications }),
        },
        select: { id: true, notificationsEnabled: true, emailNotifications: true },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const data = updateProfileSchema.parse(body);
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.language && { language: data.language }),
      },
      select: { id: true, name: true, bio: true, location: true, website: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
