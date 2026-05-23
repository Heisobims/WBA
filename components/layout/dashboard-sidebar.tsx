"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { levelProgress, cn } from "@/lib/utils";
import {
  Brain, LayoutDashboard, FileQuestion, BarChart3, Settings,
  Bell, User, Trophy, Shield, ChevronLeft, ChevronRight,
  Zap, Users, BookOpen, LogOut, CreditCard, Layers,
  GraduationCap, Flame, Play, MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[];
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard",          icon: LayoutDashboard },
  { href: "/tracks",       label: "Training Tracks",    icon: BookOpen },
  { href: "/practice",     label: "Practice",           icon: Play },
  { href: "/exams",        label: "Qualification Exams",icon: GraduationCap },
  { href: "/tutor",        label: "AI Tutor",           icon: MessageSquare },
  { href: "/leaderboard",  label: "Leaderboard",        icon: Trophy },
  { href: "/achievements", label: "Achievements",       icon: Flame },
  { href: "/analytics",   label: "Analytics",          icon: BarChart3 },
  { href: "/questionnaires", label: "Questionnaires",  icon: FileQuestion },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin",            label: "Admin Panel", icon: Shield, roles: ["SUPER_ADMIN","ADMIN"] },
  { href: "/admin/users",      label: "Users",       icon: Users,  roles: ["SUPER_ADMIN","ADMIN"] },
  { href: "/admin/moderation", label: "Moderation",  icon: Layers, roles: ["SUPER_ADMIN","ADMIN","REVIEWER"] },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile",       label: "Profile",       icon: User },
  { href: "/settings",      label: "Settings",      icon: Settings },
  { href: "/billing",       label: "Billing",       icon: CreditCard },
];

export function DashboardSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const xpData = user ? levelProgress(user.xpPoints || 0) : null;
  const userRole = user?.role || "USER";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const hasRole = (roles?: string[]) => !roles || roles.includes(userRole);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden"
      style={{ backgroundColor: "#111110" }}
    >
      {/* Logo row */}
      <div className="flex h-14 items-center px-3 shrink-0 border-b border-white/8">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0 shadow-orange">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-sm whitespace-nowrap overflow-hidden text-white"
              >
                WBAcademy
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/8 transition-all shrink-0"
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* XP strip */}
      {!sidebarCollapsed && user && xpData && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/8">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-brand-400" />
              <span className="text-[11px] font-semibold text-brand-400">Lv {xpData.level}</span>
            </div>
            <span className="text-[11px] text-white/30">
              {xpData.currentXP}/{xpData.neededXP} XP
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700"
              style={{ width: `${xpData.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2 px-2">
        <div className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Admin */}
        {ADMIN_NAV.some((item) => hasRole(item.roles)) && (
          <>
            <div className={cn("my-3 px-1", sidebarCollapsed && "px-0")}>
              {!sidebarCollapsed && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1.5 px-2">
                  Admin
                </p>
              )}
              <div className="h-px bg-white/8" />
            </div>
            <div className="space-y-0.5">
              {ADMIN_NAV.filter((item) => hasRole(item.roles)).map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="shrink-0 border-t border-white/8 p-2 space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-white/30 hover:text-white hover:bg-white/8 transition-all duration-150",
            sidebarCollapsed && "justify-center px-0",
          )}
          title={sidebarCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* User card */}
      {!sidebarCollapsed && user && (
        <div className="shrink-0 border-t border-white/8 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback name={user.name || user.email} className="text-[10px]" />
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-white/90">{user.name || "User"}</p>
              <p className="text-[10px] text-white/30 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

function SidebarLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-brand-600 text-white"
          : "text-white/40 hover:text-white hover:bg-white/8",
        collapsed && "justify-center px-0",
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[9px] font-bold bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
