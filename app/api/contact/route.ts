import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    await db.auditLog.create({
      data: {
        action: "CREATE",
        resource: "contact_message",
        resourceId: data.email,
        newData: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("[contact POST]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
