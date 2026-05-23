import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { QuestionnairesContent } from "./questionnaires-content";

export const metadata = { title: "Questionnaires" };

export default async function QuestionnairesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; search?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { isPublic: true },
      { authorId: session.user.id },
    ],
    ...(sp.status && { status: sp.status as any }),
    ...(sp.category && { category: sp.category }),
    ...(sp.search && {
      OR: [
        { title: { contains: sp.search, mode: "insensitive" as const } },
        { description: { contains: sp.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [questionnaires, total, categories] = await Promise.all([
    db.questionnaire.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { responses: true, questions: true } },
      },
    }),
    db.questionnaire.count({ where }),
    db.questionnaire.findMany({
      where: { isPublic: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  return (
    <QuestionnairesContent
      questionnaires={questionnaires}
      total={total}
      page={page}
      limit={limit}
      categories={categories.map((c) => c.category!).filter(Boolean)}
      userId={session.user.id}
    />
  );
}
