import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminDashboardContent } from "./admin-dashboard-content";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const [
    totalUsers, activeUsers, newUsersToday,
    totalQuestionnaires, publishedQuestionnaires,
    totalResponses, responsesToday,
    pendingModeration, flaggedResponses,
    recentUsers, recentAuditLogs,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    db.questionnaire.count(),
    db.questionnaire.count({ where: { status: "PUBLISHED" } }),
    db.response.count(),
    db.response.count({ where: { startedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    db.response.count({ where: { status: "FLAGGED" } }),
    db.answer.count({ where: { flagged: true } }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, image: true, role: true, status: true, createdAt: true },
    }),
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <AdminDashboardContent
      stats={{
        totalUsers,
        activeUsers,
        newUsersToday,
        totalQuestionnaires,
        publishedQuestionnaires,
        totalResponses,
        responsesToday,
        pendingModeration,
        flaggedResponses,
      }}
      recentUsers={recentUsers}
      recentAuditLogs={recentAuditLogs}
    />
  );
}
