import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminUsersContent } from "./admin-users-content";

export const metadata = { title: "Admin - Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; status?: string; page?: string };
}) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(searchParams.search && {
      OR: [
        { name: { contains: searchParams.search, mode: "insensitive" as const } },
        { email: { contains: searchParams.search, mode: "insensitive" as const } },
      ],
    }),
    ...(searchParams.role && { role: searchParams.role as any }),
    ...(searchParams.status && { status: searchParams.status as any }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, image: true,
        role: true, status: true, plan: true,
        xpPoints: true, level: true, totalResponses: true,
        createdAt: true, lastActiveAt: true,
        _count: { select: { responses: true, questionnairesCreated: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return (
    <AdminUsersContent
      users={users}
      total={total}
      page={page}
      limit={limit}
      currentUserId={session.user.id}
    />
  );
}
