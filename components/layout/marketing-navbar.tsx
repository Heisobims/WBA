"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing",  label: "Pricing" },
  { href: "/docs",     label: "Docs" },
  { href: "/contact",  label: "Contact" },
];

export function MarketingNavbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const pathname  = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-white border-b border-border shadow-sm"
          : "bg-white/80 backdrop-blur-md border-b border-transparent",
      )}
    >
      <nav className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-ink-900 flex items-center justify-center shadow-sm group-hover:bg-ink-800 transition-colors">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
WBAcademy
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3.5 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                pathname === link.href
                  ? "text-foreground bg-stone-100"
                  : "text-stone-500 hover:text-foreground hover:bg-stone-100",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 min-w-[160px] justify-end">
          {mounted && session ? (
            <Button variant="gradient" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : mounted ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/register">
                  Get started
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-stone-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-white"
          >
            <div className="container py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-foreground bg-stone-100"
                      : "text-stone-500 hover:text-foreground hover:bg-stone-100",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                {mounted && session ? (
                  <Button variant="gradient" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button variant="gradient" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/register">Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
