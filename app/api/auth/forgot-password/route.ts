import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import crypto from "crypto";

const limiter = rateLimit("auth");

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const rateLimitResult = await limiter(req);
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing tokens for this email before creating a new one
    await db.magicLink.deleteMany({ where: { email } });
    await db.magicLink.create({
      data: { email, token, expiresAt, userId: user.id },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Send email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "noreply@wbacademy.com",
          to: email,
          subject: "Reset your WBAcademy password",
          html: `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#EA5504;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        }),
      }).catch((err) => console.error("[forgot-password] email send failed", err));
    } else {
      // Log to console in dev when Resend is not configured
      console.log(`[forgot-password] Reset URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    console.error("[forgot-password]", error);
    return NextResponse.json({ success: true }); // always succeed to prevent enumeration
  }
}
