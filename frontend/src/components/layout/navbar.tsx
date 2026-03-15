"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultAppRoute } from '@/types/api';
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ទំព័រដើម" },
  { href: "/courses", label: "វគ្គសិក្សា" },
  { href: "/roadmap", label: "ផែនទីសិក្សា" },
  { href: "/about", label: "អំពីយើង" },
  { href: "/contact", label: "ទំនាក់ទំនង" },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const authHref = user ? getDefaultAppRoute(user.roles ?? []) : "/login";
  const authLabel = user ? "គណនីរបស់ខ្ញុំ" : "ចូលគណនី";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">

      {/* NAVBAR */}
      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-lg"
            : "bg-background/80 backdrop-blur"
        )}
      >
        <div className="container-app flex h-[70px] items-center justify-between">

          {/* LOGO */}
          <Link
            href="/"
            className="group inline-flex items-center gap-3"
          >
            <div className="relative">

              {/* glow */}
              <div className="absolute -inset-[4px] rounded-xl bg-gradient-to-br from-green-400 via-emerald-400 to-blue-500 opacity-0 blur-md transition group-hover:opacity-40" />

              <div className="relative h-12 w-12 rounded-xl  p-[4px] ">
                <Image
                  src="/growth.png"
                  alt="CodeGrowthKH"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>

            <div className="leading-none">
              <p className="text-[17px] font-bold tracking-tight bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                CodeGrowthKH
              </p>

              <p className="text-[11px] text-muted-foreground group-hover:text-emerald-500 transition">
                រៀនកូដជាភាសាខ្មែរ
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative text-[14px] font-medium transition"
                >
                  <span
                    className={cn(
                      active
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* active underline */}
                  <span
                    className={cn(
                      "absolute left-0 -bottom-[6px] h-[2px] w-full rounded-full transition-all",
                      active
                        ? "bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500"
                        : "opacity-0 group-hover:opacity-40 bg-emerald-400"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">

            <ThemeToggle />

            {/* AUTH */}
            <Link
              href={authHref}
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 transition"
            >
              {user ? (
                user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username ?? "Profile"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-400/40 hover:ring-emerald-500/70 transition"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center ring-2 ring-emerald-400/40">
                    <span className="text-white text-xs font-bold uppercase">
                      {(user.username ?? "U").charAt(0)}
                    </span>
                  </div>
                )
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {authLabel}
                </>
              )}
            </Link>

            {/* CTA */}
            <Button
              asChild
              className="hidden sm:flex rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 text-white"
            >
              <Link href="/courses">
                ចាប់ផ្តើមរៀន
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
            >
              {open ? <X /> : <Menu />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all",
          open ? "max-h-[400px]" : "max-h-0"
        )}
      >
        <div className="container-app py-4 space-y-2">

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-4 py-3 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}

          <Button
            asChild
            className="w-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500"
          >
            <Link href="/courses">
              ចាប់ផ្តើមរៀន
            </Link>
          </Button>

        </div>
      </div>

    </header>
  );
}
