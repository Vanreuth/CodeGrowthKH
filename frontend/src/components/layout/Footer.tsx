import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Facebook,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
} from "lucide-react";

const quickLinks = [
  { href: "/",        label: "ទំព័រដើម",     en: "Home"    },
  { href: "/courses", label: "វគ្គសិក្សា",   en: "Courses" },
  { href: "/roadmap", label: "ផែនទីសិក្សា", en: "Roadmap" },
  { href: "/about",   label: "អំពីយើង",     en: "About"   },
  { href: "/contact", label: "ទំនាក់ទំនង",   en: "Contact" },
];

const courses = [
  { label: "HTML & CSS មូលដ្ឋានគ្រឹះ",      href: "/courses" },
  { label: "JavaScript ពីដំបូង",            href: "/courses" },
  { label: "React.js UI ទំនើប",             href: "/courses" },
  { label: "Next.js Full-Stack",            href: "/courses" },
  { label: "Spring Boot Backend",           href: "/courses" },
  { label: "Docker & DevOps",               href: "/courses" },
];

const socials = [
  {
    href: "#",
    icon: Facebook,
    label: "Facebook",
    color: "hover:bg-blue-600 hover:border-blue-600 hover:text-white",
  },
  {
    href: "#",
    icon: Youtube,
    label: "YouTube",
    color: "hover:bg-red-500 hover:border-red-500 hover:text-white",
  },
  {
    href: "#",
    icon: Send,
    label: "Telegram",
    color: "hover:bg-sky-500 hover:border-sky-500 hover:text-white",
  },
];

const contacts = [
  { icon: Mail,   value: "growcodekh@gmail.com.com", href: "mailto:growcodekh@gmail.com" },
  { icon: Phone,  value: "+855 33 86 537",         href: "tel:+855 33 86 537 " },
  { icon: MapPin, value: "Phnom Penh, Cambodia",    href: "https://maps.google.com/?q=Phnom+Penh" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-background" />
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent dark:via-blue-500/30" />

      <div className="relative">

        {/* ── Newsletter banner ─────────────────────────────────────────── */}
        <div className="border-b border-border/70">
          <div className="container-app py-10">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 px-7 py-8 shadow-xl shadow-blue-600/15 md:px-10">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/8 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 left-10 h-36 w-36 rounded-full bg-white/5 blur-xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    ព័ត៌មានថ្មី
                  </p>
                  <h3 className="mt-1.5 text-xl font-extrabold text-white md:text-2xl">
                    ទទួលការអប់រំ IT ចុងក្រោយ ជាភាសាខ្មែរ
                  </h3>
                  <p className="mt-1 text-sm text-blue-100/80">
                    Course launches, tips, roadmap updates — direct to your inbox.
                  </p>
                </div>
                <div className="flex w-full shrink-0 max-w-sm gap-2">
                  <input
                    type="email"
                    placeholder="Email address..."
                    className="flex-1 min-w-0 rounded-full border border-white/20 bg-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/50 backdrop-blur-sm outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                  />
                  <button className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-lg transition-all hover:scale-[1.03] hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]">
                    Subscribe
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main footer columns ───────────────────────────────────────── */}
        <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_1fr_1.1fr]">

          {/* Brand column */}
          <div className="space-y-5">
          ​​​​​​<Link
            href="/"
            className="group inline-flex items-center gap-3"
          >
            <div className="relative">

              {/* glow */}
              <div className="absolute -inset-[4px] rounded-xl bg-gradient-to-br from-green-400 via-emerald-400 to-blue-500 opacity-0 blur-md transition group-hover:opacity-40" />

              <div className="relative h-12 w-12 rounded-xl  p-[4px] ">
                <Image
                  src="/growth.png"
                  alt="GrowCodeKhmer"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>

            <div className="leading-none">
              <p className="text-[17px] font-bold tracking-tight bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                GrowCodeKhmer
              </p>

              <p className="text-[11px] text-muted-foreground group-hover:text-emerald-500 transition">
                រៀនកូដជាភាសាខ្មែរ
              </p>
            </div>
          </Link>

            <p className="max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              វេទិកាអប់រំ IT ជាភាសាខ្មែរ ដែលជួយអ្នករៀនក្លាយជា Frontend, Backend
              និង Fullstack Developer ក្នុង 6–12 ខែ។
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "100+ Learners", color: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20" },
                { label: "10+ Courses", color: "bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20" },
                { label: "95% ពេញចិត្ត", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20" },
              ].map((s) => (
                <span key={s.label} className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.color}`}>
                  {s.label}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              {socials.map(({ href, icon: Icon, label, color }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all duration-200",
                    color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Navigation
            </p>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-border transition-all duration-200 group-hover:w-3 group-hover:bg-primary" />
                      {item.label}
                    </span>
                    <span className="text-[10px] text-border transition-colors group-hover:text-primary">
                      {item.en}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Courses
            </p>
            <ul className="space-y-3">
              {courses.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border transition-all duration-200 group-hover:w-3 group-hover:bg-primary" />
                    <span className="line-clamp-1">{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Contact Us
            </p>
            <ul className="space-y-3">
              {contacts.map(({ icon: Icon, value, href }) => (
                <li key={value}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border bg-card shadow-sm transition-all group-hover:border-primary/30 group-hover:bg-primary/5"
                    >
                      <Icon className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    </span>
                    <span>{value}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Office hours badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Mon–Sat, 8am–8pm (GMT+7)
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="border-t border-border/60">
          <div className="container-app flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-foreground">GrowCodeKh</span>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              {["Privacy Policy", "Terms of Service", "Sitemap"].map((item, i, arr) => (
                <span key={item} className="flex items-center">
                  <Link
                    href="#"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                  {i < arr.length - 1 && (
                    <span className="mx-3 h-3 w-px bg-border" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

// tiny cn helper (in case not imported at module level)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}