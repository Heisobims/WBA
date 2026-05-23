import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUpdateUserSchema } from "@/lib/validations";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = adminUpdateUserSchema.parse(body);

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status as any }),
        ...(data.plan && { plan: data.plan as any }),
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: data.status === "SUSPENDED" ? "SUSPEND" : "UPDATE",
        resource: "user",
        resourceId: id,
        newData: data,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
