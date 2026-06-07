import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminQuestionnairesContent } from "./admin-questionnaires-content";

export const metadata = { title: "Admin - Questionnaires" };

export default async function AdminQuestionnairesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const limit = 20;

  const where: any = {};
  if (sp.search) where.title = { contains: sp.search, mode: "insensitive" };
  if (sp.status) where.status = sp.status;

  const [questionnaires, total] = await Promise.all([
    db.questionnaire.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { questions: true, responses: true } },
      },
    }),
    db.questionnaire.count({ where }),
  ]);

  return (
    <AdminQuestionnairesContent
      questionnaires={questionnaires as any}
      total={total}
      page={page}
      limit={limit}
    />
  );
}
