import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { QuestionnairePlayerShell } from "@/components/questionnaire/player/questionnaire-player-shell";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const q = await db.questionnaire.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  });
  return { title: q?.title || "Questionnaire", description: q?.description };
}

export default async function PlayQuestionnairePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session) redirect(`/login?callbackUrl=/questionnaires/play/${params.id}`);

  const questionnaire = await db.questionnaire.findUnique({
    where: { id: params.id },
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
        questionnaireId: params.id,
        userId: session.user.id,
        status: "COMPLETED",
      },
    });
    if (attempts >= questionnaire.maxAttempts) {
      redirect(`/questionnaires/${params.id}?error=max-attempts`);
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
