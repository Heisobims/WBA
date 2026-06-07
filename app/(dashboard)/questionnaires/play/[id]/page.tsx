import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { QuestionnairePlayerShell } from "@/components/questionnaire/player/questionnaire-player-shell";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await db.questionnaire.findUnique({
    where: { id },
    select: { title: true, description: true },
  });
  return { title: q?.title || "Questionnaire", description: q?.description };
}

export default async function PlayQuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/login?callbackUrl=/questionnaires/play/${id}`);

  const questionnaire = await db.questionnaire.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      author: { select: { id: true, name: true } },
    },
  });

  if (!questionnaire) notFound();

  if (
    questionnaire.status !== "PUBLISHED" &&
    questionnaire.authorId !== session.user.id &&
    !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)
  ) {
    redirect("/questionnaires");
  }

  // Check if user already completed max attempts
  if (questionnaire.maxAttempts) {
    const attempts = await db.response.count({
      where: {
        questionnaireId: id,
        userId: session.user.id,
        status: "COMPLETED",
      },
    });
    if (attempts >= questionnaire.maxAttempts) {
      redirect(`/questionnaires/${id}?error=max-attempts`);
    }
  }

  return (
    <QuestionnairePlayerShell
      questionnaire={questionnaire}
      questions={questionnaire.questions}
      userId={session.user.id}
    />
  );
}
