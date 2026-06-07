import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AuditLogsContent } from "./audit-logs-content";

export const metadata = { title: "Admin - Audit Logs" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; resource?: string }>;
}) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const limit = 50;

  const where: any = {};
  if (sp.action) where.action = sp.action;
  if (sp.resource) where.resource = sp.resource;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.auditLog.count({ where }),
  ]);

  return <AuditLogsContent logs={logs as any} total={total} page={page} limit={limit} />;
}
