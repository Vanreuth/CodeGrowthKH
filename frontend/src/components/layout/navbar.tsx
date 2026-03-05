"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  ChevronRight,
  GraduationCap,
  Mail,
  Menu,
  Phone,
  Sparkles,
  X,
  User,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",        label: "ទំព័រដើម",     english: "Home",     emoji: "🏠" },
  { href: "/courses", label: "វគ្គសិក្សា",   english: "Courses",  emoji: "📚" },
  { href: "/roadmap", label: "ផែនទីសិក្សា", english: "Roadmap",  emoji: "🗺️" },
  { href: "/about",   label: "អំពីយើង",     english: "About",    emoji: "✨" },
  { href: "/contact", label: "ទំនាក់ទំនង",   english: "Contact",  emoji: "💬" },
];

export default function Navbar() {
  const { user }   = useAuth();
  const pathname   = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const authHref  = user ? "/account" : "/login";
  const authLabel = user ? "គណនីរបស់ខ្ញុំ" : "ចូលគណនី";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">

      {/* ── Announcement bar ─────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white">
          <div className="container-app flex h-9 items-center justify-between text-xs">
            <p className="flex items-center gap-2 font-medium">
              <BookOpenCheck className="h-3 w-3 shrink-0 opacity-80" />
              <span className="opacity-90">ស្វាគមន៍មកកាន់ ADUTI Learning — Learn to Code in Khmer</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                <Sparkles className="h-2.5 w-2.5" />
                New courses added
              </span>
            </p>
            <div className="flex items-center divide-x divide-white/20 text-white/75">
              <span className="inline-flex items-center gap-1.5 pr-4 transition-colors hover:text-white">
                <Phone className="h-3 w-3" />+855 12 345 678
              </span>
              <span className="inline-flex items-center gap-1.5 pl-4 transition-colors hover:text-white">
                <Mail className="h-3 w-3" />hello@adutilearning.com
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main nav ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "border-b bg-white/95 backdrop-blur-2xl transition-all duration-300 dark:bg-slate-950/90",
          scrolled
            ? "border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:border-white/10 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
            : "border-slate-100/60 dark:border-white/8"
        )}
      >
        <div className="container-app flex h-[62px] items-center justify-between">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="group inline-flex items-center gap-3 shrink-0"
          >
            {/* Logo mark */}
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-[11px] bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40 group-hover:shadow-xl">
                <GraduationCap className="h-5 w-5 drop-shadow-sm" />
              </div>
              {/* Online indicator dot */}
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
              </span>
            </div>

            {/* Logo text */}
            <div className="leading-none">
              <p className="text-[15px] font-bold tracking-[-0.02em] text-slate-900 dark:text-white">
                ADUTI Learning
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400 transition-colors group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400">
                រៀនកូដជាភាសាខ្មែរ
              </p>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-200 select-none",
                    active
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white"
                  )}
                >
                  {item.label}
                  {/* Active underline indicator */}
                  {!active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-4/5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />

            {/* Auth link — desktop */}
            <Link
              href={authHref}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white"
            >
              {user
                ? <><User className="h-3.5 w-3.5" />{authLabel}</>
                : <><LogIn className="h-3.5 w-3.5" />{authLabel}</>}
            </Link>

            {/* CTA button */}
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/35 hover:shadow-lg"
            >
              <Link href="/courses">
                ចាប់ផ្តើមរៀន
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "relative ml-1 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 lg:hidden",
                open
                  ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white"
              )}
            >
              <span className={cn("absolute transition-all duration-200", open ? "opacity-100 rotate-0" : "opacity-0 rotate-90")}>
                <X className="h-5 w-5" />
              </span>
              <span className={cn("absolute transition-all duration-200", open ? "opacity-0 -rotate-90" : "opacity-100 rotate-0")}>
                <Menu className="h-5 w-5" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          "overflow-hidden border-b border-slate-200/70 bg-white/98 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/98 lg:hidden",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-app pb-6 pt-3 space-y-1.5">

          {/* Nav links */}
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-blue-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base leading-none">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
                <span className={cn("text-xs", active ? "text-white/70" : "text-slate-400")}>
                  {item.english}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="!my-3 h-px bg-slate-100 dark:bg-white/8" />

          {/* CTA row */}
          <div className="grid grid-cols-2 gap-2 !mt-2">
            <Button asChild variant="outline" className="rounded-2xl border-slate-200 font-medium dark:border-white/10">
              <Link href={authHref}>
                {user ? <User className="mr-2 h-3.5 w-3.5" /> : <LogIn className="mr-2 h-3.5 w-3.5" />}
                {authLabel}
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-violet-500"
            >
              <Link href="/courses">
                ចាប់ផ្តើម Free
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Contact strip */}
          <div className="!mt-3 flex items-center justify-center gap-5 rounded-2xl bg-slate-50 px-4 py-2.5 dark:bg-white/5">
            <a href="tel:+85512345678" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
              <Phone className="h-3 w-3" />+855 12 345 678
            </a>
            <span className="h-3 w-px bg-slate-200 dark:bg-white/10" />
            <a href="mailto:hello@adutilearning.com" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
              <Mail className="h-3 w-3" />hello@adutilearning.com
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}