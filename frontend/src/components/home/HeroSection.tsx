import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, Play, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRUST_BADGES = [
  "ចាប់ផ្តើមដោយឥតគិតថ្លៃ",
  "មិនត្រូវការបទពិសោធន៍",
  "ភាសាខ្មែរ",
  "Certificate បញ្ចប់",
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
      {/* ── Full-bleed aurora background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base deep ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0a1b3f] to-[#082f49]" />

        {/* Radial glow cores */}
        <div className="absolute -top-36 left-1/2 h-[700px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-400/30 via-blue-500/18 to-transparent blur-3xl" />
        <div className="absolute -bottom-44 -left-44 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-cyan-400/25 to-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-32 h-[460px] w-[460px] rounded-full bg-gradient-to-tl from-indigo-500/25 to-sky-400/10 blur-3xl" />
        <div className="absolute top-16 right-16 h-56 w-56 rounded-full bg-cyan-300/12 blur-3xl" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #7dd3fc 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-12 lg:grid-cols-2">
        {/* Left — Text */}
        <div className="flex flex-col items-start gap-7">
          <Badge className="border-white/20 bg-white/10 px-3 py-1.5 text-cyan-100 backdrop-blur-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            វេទិការៀនកូដ #1 ជាភាសាខ្មែរ
          </Badge>

          <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-5xl xl:text-6xl">
            ចាប់ផ្តើមដំណើរ
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Software Engineer
            </span>
            <br />
            ជាមួយភាសា{" "}
            <span className="relative inline-block">
              ខ្មែរ
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M0 6 Q25 1 50 6 Q75 11 100 6"
                  stroke="url(#hero-ul)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="hero-ul" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
            ADUTI Learning ផ្តល់{" "}
            <span className="font-semibold text-white">
              courses ជាភាសាខ្មែរ
            </span>
            , roadmap ជាជំហានច្បាស់, និង mentor support —
            ដើម្បីជួយអ្នកពី zero ក្លាយជា developer ក្នុង 6–12 ខែ។
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/30"
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
              className="rounded-full border-white/25 bg-white/10 px-8 text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/20"
            >
              <Link href="/roadmap">
                <Play className="mr-2 h-4 w-4 fill-current" />
                មើល Roadmap
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            {TRUST_BADGES.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
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
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-md ring-1 ring-white/5">
          {/* Window chrome */}
          <div className="mb-4 flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-amber-400/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-xs text-slate-400">hello_world.js</span>
          </div>
          <pre className="overflow-x-auto text-sm leading-6">
            <code className="font-mono">
              <span className="text-violet-400">function</span>
              <span className="text-slate-200"> greet</span>
              <span className="text-slate-400">(</span>
              <span className="text-amber-400">name</span>
              <span className="text-slate-400">) {"{"}</span>
              {"\n"}
              {"  "}
              <span className="text-blue-400">return</span>
              {" "}
              <span className="text-emerald-400">{"`"}សូមស្វាគមន៍{" ${"}</span>
              <span className="text-amber-400">name</span>
              <span className="text-emerald-400">{"}"} 🎉{"`"}</span>
              <span className="text-slate-400">;</span>
              {"\n"}
              <span className="text-slate-400">{"}"}</span>
              {"\n\n"}
              <span className="text-blue-400">console</span>
              <span className="text-slate-400">.</span>
              <span className="text-yellow-400">log</span>
              <span className="text-slate-400">(</span>
              <span className="text-slate-200">greet</span>
              <span className="text-slate-400">(</span>
              <span className="text-emerald-400">&quot;ADUTI&quot;</span>
              <span className="text-slate-400">));</span>
              {"\n"}
              <span className="text-slate-500">{"// សូមស្វាគមន៍ ADUTI 🎉"}</span>
            </code>
          </pre>
        </div>

        {/* Floating stat pills */}
        <div className="absolute -left-10 top-8 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-900/80 px-3 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            ✓
          </div>
          <span className="text-xs font-medium text-slate-200">
            2,400+ អ្នករៀន
          </span>
        </div>

        <div className="absolute -right-8 bottom-16 flex items-center gap-2 rounded-full border border-amber-400/30 bg-slate-900/80 px-3 py-2 shadow-lg backdrop-blur-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-slate-200">
            4.9 / 5.0
          </span>
        </div>

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-violet-400/30 bg-slate-900/80 px-4 py-2 shadow-lg backdrop-blur-sm">
          <GraduationCap className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-slate-200">
            30+ Courses • ឥតគិតថ្លៃ
          </span>
        </div>
      </div>
    </div>
  );
}
