import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DatasetsContent } from "./datasets-content";

export const metadata = { title: "Admin - Datasets" };

export default async function AdminDatasetsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "AI_TRAINER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const limit = 20;

  const [datasets, total, questionnaires] = await Promise.all([
    db.dataset.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true } } },
    }),
    db.dataset.count(),
    db.questionnaire.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, totalResponses: true },
      orderBy: { totalResponses: "desc" },
      take: 30,
    }),
  ]);

  return (
    <DatasetsContent
      datasets={datasets as any}
      total={total}
      page={page}
      limit={limit}
      questionnaires={questionnaires}
    />
  );
}
