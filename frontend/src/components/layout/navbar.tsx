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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ទំព័រដើម", english: "Home" },
  { href: "/courses", label: "វគ្គសិក្សា", english: "Courses" },
  { href: "/roadmap", label: "ផែនទីសិក្សា", english: "Roadmap" },
  { href: "/about", label: "អំពីយើង", english: "About" },
  { href: "/contact", label: "ទំនាក់ទំនង", english: "Contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const authHref = user ? "/account" : "/login";
  const authLabel = user ? "គណនីរបស់ខ្ញុំ" : "ចូលគណនី";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white md:block">
        <div className="container-app flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2 font-medium">
            <BookOpenCheck className="h-3 w-3 shrink-0" />
            <span>ស្វាគមន៍មកកាន់ ADUTI Learning – Learn Code in Khmer</span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              New courses added
            </span>
          </p>
          <div className="flex items-center divide-x divide-white/25">
            <span className="inline-flex items-center gap-1.5 pr-4">
              <Phone className="h-3 w-3" />
              +855 12 345 678
            </span>
            <span className="inline-flex items-center gap-1.5 pl-4">
              <Mail className="h-3 w-3" />
              hello@adutilearning.com
            </span>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div
        className={cn(
          "border-b bg-white/90 backdrop-blur-xl transition-shadow duration-300 dark:bg-slate-950/85",
          scrolled
            ? "border-blue-100/80 shadow-md shadow-slate-900/5 dark:border-white/10 dark:shadow-black/25"
            : "border-blue-100/40 dark:border-white/10"
        )}
      >
        <div className="mx-auto w-full max-w-6xl flex h-16 items-center justify-between ">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group inline-flex items-center gap-2.5 shrink-0"
          >
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900 dark:text-white">ADUTI Learning</p>
              <p className="text-[11px] text-slate-500 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-300">
                រៀនកូដជាភាសាខ្មែរ
              </p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />

            <Link
              href={authHref}
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white sm:block"
            >
              {authLabel}
            </Link>

            <Button
              asChild
              size="sm"
              className="hidden rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/30 hover:from-blue-500 hover:to-violet-500 sm:inline-flex"
            >
              <Link href="/courses">
                <span>ចាប់ផ្តើមរៀន</span>
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-b border-blue-100/70 bg-white/97 px-4 pb-5 pt-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/97 lg:hidden">
          <nav className="container-app space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-white/8"
                )}
              >
                <span>{item.label}</span>
                <span className="text-xs opacity-60">{item.english}</span>
              </Link>
            ))}

            <div className="!mt-4 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={authHref} onClick={() => setOpen(false)}>
                  {authLabel}
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500"
              >
                <Link href="/courses" onClick={() => setOpen(false)}>
                  ចាប់ផ្តើមរៀន
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
