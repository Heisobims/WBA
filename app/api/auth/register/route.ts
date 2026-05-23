import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "ACTIVE",
        emailVerified: new Date(),
        referralCode: generateUniqueSlug(name).slice(0, 12),
      },
      select: { id: true, email: true, name: true },
    });

    // Create initial achievements
    const firstSteps = await db.achievement.findFirst({
      where: { name: "first-steps" },
    });
    if (firstSteps) {
      await db.userAchievement.create({
        data: { userId: user.id, achievementId: firstSteps.id, progress: 100 },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
