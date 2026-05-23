"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_COLORS, STATUS_COLORS, formatDate, formatRelative } from "@/lib/utils";
import { Search, MoreHorizontal, UserX, ShieldCheck, Download } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  status: string;
  plan: string;
  xpPoints: number;
  level: number;
  totalResponses: number;
  createdAt: Date;
  lastActiveAt: Date | null;
  _count: { responses: number; questionnairesCreated: number };
}

interface AdminUsersContentProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  currentUserId: string;
}

export function AdminUsersContent({
  users, total, page, limit, currentUserId,
}: AdminUsersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleAction = async (userId: string, action: string, value: string) => {
    if (userId === currentUserId) {
      toast.error("Cannot modify your own account");
      return;
    }
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [action]: value }),
      });
      toast.success("User updated");
      router.refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm">{total.toLocaleString()} registered users</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); updateParam("search", searchValue); }}
          className="flex-1 min-w-[200px] max-w-xs"
        >
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search users..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </form>

        <div className="flex gap-2">
          {["USER", "AI_TRAINER", "REVIEWER", "ADMIN"].map((role) => (
            <Button
              key={role}
              variant={searchParams.get("role") === role ? "default" : "outline"}
              size="sm"
              onClick={() => updateParam("role", searchParams.get("role") === role ? "" : role)}
            >
              {role.replace("_", " ")}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"].map((status) => (
            <Button
              key={status}
              variant={searchParams.get("status") === status ? "default" : "ghost"}
              size="sm"
              onClick={() => updateParam("status", searchParams.get("status") === status ? "" : status)}
            >
              {status.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card variant="default">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Plan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">XP / Level</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Responses</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joined</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback name={user.name || user.email || ""} />
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name || "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border ${ROLE_COLORS[user.role]}`}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border ${STATUS_COLORS[user.status]}`}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{user.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{user.xpPoints.toLocaleString()} XP · L{user.level}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{user._count.responses}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {user.status !== "SUSPENDED" ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleAction(user.id, "status", "SUSPENDED")}
                            disabled={actionLoading === user.id || user.id === currentUserId}
                            title="Suspend"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-green-400 hover:text-green-400"
                            onClick={() => handleAction(user.id, "status", "ACTIVE")}
                            disabled={actionLoading === user.id}
                            title="Activate"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" onClick={() => updateParam("page", String(page - 1))}>
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          {page < Math.ceil(total / limit) && (
            <Button variant="outline" size="sm" onClick={() => updateParam("page", String(page + 1))}>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
