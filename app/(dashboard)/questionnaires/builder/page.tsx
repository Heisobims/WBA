import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuestionnaireBuilder } from "@/components/questionnaire/builder/questionnaire-builder";

export const metadata = { title: "Questionnaire Builder" };

export default async function BuilderPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <QuestionnaireBuilder userId={session.user.id} />;
}
