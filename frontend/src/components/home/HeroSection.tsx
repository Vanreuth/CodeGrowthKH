import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Play,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRUST_BADGES = [
  "ចាប់ផ្តើមដោយឥតគិតថ្លៃ",
  "មិនត្រូវការបទពិសោធន៍",
  "ភាសាខ្មែរ",
];

export function HeroSection() {
  return (
    <section
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden py-14 md:py-20 lg:py-24"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
    
      {/* ── Top bar ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base — inherits the active theme's --background */}
        <div className="absolute inset-0 bg-background transition-colors duration-300" />

        {/* Primary glow — top center */}
        <div
          className="absolute -top-36 left-1/2 h-[700px] w-[980px] -translate-x-1/2 rounded-full blur-3xl transition-colors duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
          }}
        />

        {/* Accent glow — bottom left */}
        <div
          className="absolute -bottom-44 -left-44 h-[520px] w-[520px] rounded-full blur-3xl transition-colors duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--accent) 20%, transparent), transparent 70%)",
          }}
        />

        {/* Primary glow — bottom right */}
        <div
          className="absolute -bottom-24 -right-32 h-[460px] w-[460px] rounded-full blur-3xl transition-colors duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
          }}
        />

        {/* Ring accent — top right */}
        <div
          className="absolute top-16 right-16 h-56 w-56 rounded-full blur-3xl transition-colors duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 14%, transparent), transparent 70%)",
          }}
        />

        {/* Dot grid using theme primary */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top-edge shimmer line */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-25"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--primary), var(--accent), transparent)",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-12 lg:grid-cols-2">
        {/* Left — Text */}
        <div className="flex flex-col items-start gap-7">
          {/* Theme-coloured badge */}
          <Badge
            className="border-primary/25 bg-primary/10 px-3 py-1.5 text-primary
                       backdrop-blur-sm transition-colors duration-300"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            វេទិការៀនកូដ #1 ជាភាសាខ្មែរ
          </Badge>

          {/* Heading using theme foreground + primary→accent gradient */}
          <h1
            className="text-4xl font-extrabold leading-[1.2] tracking-tight
                       text-foreground transition-colors duration-300
                       sm:text-5xl xl:text-6xl"
          >
            ចាប់សិក្សា​កូដ​
            <br />
            ជាភាសា{" "}
            <span className="relative inline-block text-foreground">
              ខ្មែរ
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M0 6 Q25 1 50 6 Q75 11 100 6"
                  stroke="url(#hero-ul)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="hero-ul" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
             ជាមួយ
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--primary), var(--accent), var(--primary))",
              }}
            >
              GrowCodeKh
            </span>
            
          </h1>

          {/* Body copy */}
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg transition-colors duration-300">
            GrowCodeKh ផ្តល់{" "}
            <span className="font-semibold text-foreground">
              courses ជាភាសាខ្មែរ
            </span>
            , roadmap ជាជំហានច្បាស់
            ដើម្បីជួយអ្នកពី zero ក្លាយជា developer ក្នុង 6–12 ខែ។
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-primary-foreground shadow-xl
                         transition-all hover:scale-[1.02] hover:brightness-110 hover:shadow-lg"
              style={{
                background: "linear-gradient(to right, var(--primary), var(--accent))",
              }}
            >
              <Link href="/courses">
                ចាប់ផ្តើមរៀន Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-border bg-secondary/40 px-8 text-secondary-foreground
                         backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-secondary/70"
            >
              <Link href="/courses/download_pdf">
                <Play className="mr-2 h-4 w-4 fill-current" />
                ទាញយក​សៀវភៅ​ Free
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground transition-colors duration-300">
            {TRUST_BADGES.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--chart-2)" }}
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Visual card */}
        <HeroVisualCard />
      </div>
    </section>
  );
}

function HeroVisualCard() {
  return (
    <div className="relative hidden lg:flex lg:justify-center">
      <div className="relative w-full max-w-md">
        {/* Main code card */}
        <div
          className="relative rounded-2xl border border-border bg-card/70 p-6
                     shadow-2xl shadow-black/20 backdrop-blur-md ring-1 ring-border/50
                     transition-colors duration-300"
        >
          {/* Window chrome */}
          <div className="mb-4 flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-amber-400/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-xs text-muted-foreground">hello_world.js</span>
          </div>

          <pre className="overflow-x-auto text-sm leading-6">
            <code className="font-mono">
              <span className="text-violet-500 dark:text-violet-400">function</span>
              <span className="text-foreground"> greet</span>
              <span className="text-muted-foreground">(</span>
              <span className="text-amber-500 dark:text-amber-400">name</span>
              <span className="text-muted-foreground">) {"{"}</span>
              {"\n"}{"  "}
              <span className="text-blue-500 dark:text-blue-400">return</span>
              {" "}
              <span className="text-emerald-600 dark:text-emerald-400">{"`"}សូមស្វាគមន៍{" ${"}</span>
              <span className="text-amber-500 dark:text-amber-400">name</span>
              <span className="text-emerald-600 dark:text-emerald-400">{"}"} 🎉{"`"}</span>
              <span className="text-muted-foreground">;</span>
              {"\n"}
              <span className="text-muted-foreground">{"}"}</span>
              {"\n\n"}
              <span className="text-blue-500 dark:text-blue-400">console</span>
              <span className="text-muted-foreground">.</span>
              <span className="text-yellow-500 dark:text-yellow-400">log</span>
              <span className="text-muted-foreground">(</span>
              <span className="text-foreground">greet</span>
              <span className="text-muted-foreground">(</span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;GrowCodeKh&quot;</span>
              <span className="text-muted-foreground">));</span>
              {"\n"}
              <span className="text-muted-foreground/60">{"// សូមស្វាគមន៍ GrowCodeKh 🎉"}</span>
            </code>
          </pre>
        </div>

        {/* Floating pill — student count */}
        <div
          className="absolute -left-10 top-8 flex items-center gap-2 rounded-full
                     border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm
                     transition-colors duration-300"
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
            style={{ background: "var(--accent)" }}
          >
            ✓
          </div>
          <span className="text-xs font-medium text-foreground">100+ អ្នករៀន</span>
        </div>

        {/* Floating pill — rating */}
        <div
          className="absolute -right-8 bottom-16 flex items-center gap-2 rounded-full
                     border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm
                     transition-colors duration-300"
        >
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-foreground">4.9 / 5.0</span>
        </div>

        {/* Floating pill — courses */}
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2
                     rounded-full border border-border bg-card/90 px-4 py-2 shadow-lg
                     backdrop-blur-sm transition-colors duration-300 whitespace-nowrap"
        >
          <GraduationCap className="h-4 w-4" style={{ color: "var(--primary)" }} />
          <span className="text-xs font-medium text-foreground">
            10+ Courses • ឥតគិតថ្លៃ
          </span>
        </div>
      </div>
    </div>
  );
}
