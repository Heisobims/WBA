import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ModerationContent } from "./moderation-content";

export const metadata = { title: "Admin - Moderation" };

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "REVIEWER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;

  const [flagged, total] = await Promise.all([
    db.response.findMany({
      where: { status: "FLAGGED" },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        questionnaire: { select: { id: true, title: true } },
        answers: {
          take: 3,
          select: {
            id: true,
            textValue: true,
            question: { select: { title: true, type: true } },
          },
        },
      },
    }),
    db.response.count({ where: { status: "FLAGGED" } }),
  ]);

  return <ModerationContent responses={flagged as any} total={total} page={page} limit={limit} />;
}
