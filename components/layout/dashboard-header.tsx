"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/store/ui-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Zap, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { data: session } = useSession();
  const { sidebarCollapsed, setCommandMenuOpen } = useUIStore();

  const user = session?.user;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-14 flex items-center gap-3 px-5 border-b border-border bg-white z-30 transition-all duration-250",
        sidebarCollapsed ? "left-16" : "left-64",
      )}
    >
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setCommandMenuOpen(true)}
        className="flex items-center gap-2 h-8 px-3 rounded-md bg-stone-100 border border-border text-stone-400 text-sm hover:bg-stone-200 hover:text-stone-600 transition-all duration-150 min-w-[180px] max-w-xs"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search…</span>
        <kbd className="text-[10px] font-mono bg-white border border-border px-1.5 py-0.5 rounded hidden sm:block text-stone-400">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* XP chip */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200">
            <Zap className="h-3 w-3 text-brand-600" />
            <span className="text-xs font-semibold text-brand-700">
              {(user.xpPoints || 0).toLocaleString()} XP
            </span>
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative" asChild>
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
          </Link>
        </Button>

        {/* Practice CTA */}
        <Button variant="gradient" size="sm" className="hidden md:flex" asChild>
          <Link href="/practice">
            <Play className="h-3.5 w-3.5" />
            Practice
          </Link>
        </Button>

        {/* Avatar */}
        <Link href="/profile">
          <Avatar className="h-7 w-7 ring-2 ring-transparent hover:ring-brand-300 transition-all cursor-pointer">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback name={user?.name || user?.email} className="text-[10px]" />
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
