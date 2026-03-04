import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Handshake,
  Layers3,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="space-y-10 pb-16 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-sm md:p-12 dark:border-white/10 dark:bg-slate-900/70">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/10 via-violet-400/10 to-pink-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-gradient-to-tr from-emerald-400/8 to-cyan-300/8 blur-2xl" />

        <div className="relative max-w-3xl">
          <Badge className="mb-4 border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles className="mr-1.5 h-3 w-3" />
            អំពី ADUTI Learning
          </Badge>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white">
            យើងជួយអ្នករៀន ក្លាយជា{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Software Engineer
            </span>{" "}
            ពិតប្រាកដ
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
            ADUTI Learning គឺជាវេទិកា ed-tech ជាភាសាខ្មែរ ដែលបំពេញចន្លោះរវាង
            &ldquo;tutorial follower&rdquo; និង &ldquo;real developer&rdquo; — ដោយ courses
            ច្បាស់លាស់, roadmap ជាជំហាន, mentor support, និង project ពិតប្រាកដ។
          </p>

          {/* Pull quote */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/5">
            <Quote className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
            <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
              &ldquo;We don&apos;t just teach syntax — we build engineers who think in systems,
              ship production code, and grow with their teams.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {platformStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/70"
          >
            <span className="text-3xl leading-none">{stat.icon}</span>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
              {stat.value}
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {stat.label}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{stat.labelEn}</span>
          </div>
        ))}
      </section>

      {/* ── Mission + Timeline ─────────────────────────────────────────────── */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Mission */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl shadow-md shadow-blue-500/20">
              🎯
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              បេសកកម្មរបស់យើង
            </h2>
            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-400">
              Our Mission
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              ធ្វើឲ្យការអប់រំ software engineering ជាភាសាខ្មែរ{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                មានគុណភាព, ចូលប្រើបានដោយសេរី
              </strong>{" "}
              ហើយត្រូវនឹងតម្រូវការ industry ពិត — ដើម្បីជួយ developer ជំនាន់ក្រោយ
              របស់កម្ពុជាឡើងដល់ global standard។
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {["ភាសាខ្មែរ", "Project-Based", "Industry-Ready", "Community"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-5 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ដំណើររបស់ ADUTI
            </h2>
          </div>
          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 h-[calc(100%-8px)] w-px bg-gradient-to-b from-slate-200 to-transparent dark:from-white/10" />
            {milestones.map((m, i) => (
              <div key={m.year} className="relative flex items-start gap-4 pl-7">
                <div className="absolute left-0 top-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[9px] font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {m.year}
                  </span>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-6 text-center">
          <Badge className="mb-3 border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <ShieldCheck className="mr-1.5 h-3 w-3" />
            គុណតម្លៃ / Our Values
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            អ្វីដែល{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              យើងជឿជាក់
            </span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.color} text-2xl shadow-md ${v.shadow}`}
              >
                {v.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{v.titleKh}</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{v.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {v.descKh}
              </p>
              {/* Accent line */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${v.color} transition-all duration-500 group-hover:w-full`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-6">
          <Badge className="mb-3 border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Users className="mr-1.5 h-3 w-3" />
            Mentor Team
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            អ្នកណែនាំ{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ដំណើរសិក្សា
            </span>
            របស់អ្នក
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            People guiding your learning journey — active practitioners, not just teachers.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {teamHighlights.map((member) => (
            <div
              key={member.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70"
            >
              {/* Gradient header */}
              <div className={`flex items-center gap-4 bg-gradient-to-r ${member.gradient} p-5`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-base font-bold text-white backdrop-blur-sm">
                  {member.avatar}
                </div>
                <div>
                  <p className="font-bold text-white">{member.name}</p>
                  <p className="text-xs text-white/80">{member.roleKh}</p>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {member.summaryKh}
                </p>

                {/* Topic chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {member.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why different ───────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-10">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            ហេតុអ្វី ADUTI ខុសពីការ YouTube ឬ bootcamp ធម្មតា?
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { point: "ភាសាខ្មែរ 100%", sub: "ពន្យល់ concepts ពិបាកៗ ជាភាសាខ្មែរ" },
            { point: "Roadmap ជាជំហាន", sub: "ដឹងច្បាស់ថារៀនអ្វីមុន អ្វីក្រោយ" },
            { point: "Project Portfolio", sub: "គ្រប់ phase មាន real project" },
            { point: "Mentor Feedback", sub: "Code review weekly ពី practitioners" },
            { point: "Community", sub: "ចូលរួមមួយជាមួយ 2,400+ learners" },
            { point: "Certificate", sub: "Completion certificate ទទួលស្គាល់" },
          ].map((item) => (
            <div
              key={item.point}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/5"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {item.point}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-7 py-12 text-center text-white shadow-2xl shadow-blue-600/20 md:px-12 md:py-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative space-y-4">
          <Badge className="border-white/30 bg-white/15 text-white">
            <Sparkles className="mr-1.5 h-3 w-3" />
            ចូលរួមមួយជាមួយ 2,400+ learners
          </Badge>
          <h2 className="text-2xl font-extrabold md:text-4xl">
            ត្រៀមចាប់ផ្តើម
            <br />
            <span className="text-yellow-300">ដំណើររបស់អ្នក</span> ហើយ?
          </h2>
          <p className="mx-auto max-w-md text-blue-100">
            ចូលរៀន Free ថ្ងៃនេះ — courses, roadmap, mentor support ជាភាសាខ្មែរ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-blue-700 shadow-xl hover:scale-[1.02] hover:bg-blue-50"
            >
              <Link href="/register">
                ចុះឈ្មោះ Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full text-white hover:bg-white/15"
            >
              <Link href="/roadmap">
                មើល Roadmap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export const platformStats = [
  { value: "2,400+", label: "សិស្សសកម្ម", labelEn: "Active Learners", icon: "👨‍💻" },
  { value: "30+", label: "វគ្គសិក្សា", labelEn: "Courses", icon: "📚" },
  { value: "95%", label: "អត្រាពេញចិត្ត", labelEn: "Satisfaction Rate", icon: "⭐" },
  { value: "6–12", label: "ខែដើម្បីក្លាយជា Dev", labelEn: "Months to Developer", icon: "🚀" },
];

export const teamHighlights = [
  {
    name: "Sokha Vann",
    role: "Lead Instructor — Frontend",
    roleKh: "គ្រូបង្រៀនដឹកនាំ — Frontend",
    summary:
      "5+ years building React and Next.js applications at scale. Passionate about making frontend concepts accessible to Khmer learners through practical, real-world projects.",
    summaryKh:
      "បទពិសោធន៍ 5+ ឆ្នាំក្នុងការសរសេរ React/Next.js app។ ចូលចិត្ត Frontend ជាមួយ Khmer learners",
    avatar: "SV",
    gradient: "from-blue-500 to-sky-400",
    topics: ["React", "Next.js", "TypeScript", "Tailwind"],
    linkedin: "#",
  },
  {
    name: "Dara Chhem",
    role: "Backend Instructor — Java & DevOps",
    roleKh: "គ្រូ Backend — Java & DevOps",
    summary:
      "Software engineer with deep experience in Spring Boot microservices, Docker, and CI/CD pipelines. Focuses on production-grade thinking from day one.",
    summaryKh:
      "Engineer ជំនាញ Spring Boot, Docker, CI/CD ។ ផ្តោតលើ production mindset ចាប់ពីដំបូង",
    avatar: "DC",
    gradient: "from-emerald-500 to-teal-400",
    topics: ["Java", "Spring Boot", "Docker", "PostgreSQL"],
    linkedin: "#",
  },
  {
    name: "Sreymom Keo",
    role: "Fullstack Mentor & Community Lead",
    roleKh: "Mentor Fullstack & ដឹកនាំសហគមន៍",
    summary:
      "Fullstack developer and community builder. Manages learner progress, runs weekly code reviews, and ensures no student gets left behind on their journey.",
    summaryKh:
      "Fullstack developer ដឹកនាំ community, code review weekly, ណែនាំសិស្សគ្រប់ជំហាន",
    avatar: "SK",
    gradient: "from-violet-500 to-purple-400",
    topics: ["Node.js", "React", "Mentoring", "Code Review"],
    linkedin: "#",
  },
];

export const values = [
  {
    titleKh: "រៀនតាមគម្រោងពិត",
    title: "Project-First Learning",
    descKh: "គ្រប់ phase នីមួយៗ បញ្ចប់ដោយ project ពិតប្រាកដ ដែលអ្នកអាចបន្ថែមទៅក្នុង portfolio",
    desc: "Every phase ends with a real project you can add to your portfolio.",
    icon: "🎯",
    color: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/20",
  },
  {
    titleKh: "វិន័យ Engineering",
    title: "Engineering Discipline",
    descKh: "យើងផ្តោតលើ architecture, testing habits និង production-level thinking ជានិច្ច",
    desc: "Architecture decisions, testing habits, and production-level thinking from day one.",
    icon: "🛡️",
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    titleKh: "ត្រូវនឹងតម្រូវការការងារ",
    title: "Career Alignment",
    descKh: "Curriculum រៀបចំតាម role expectations ពិតប្រាកដ នៅក្នុងក្រុមហ៊ុន IT",
    desc: "Curriculum designed around real software engineering role expectations.",
    icon: "🎖️",
    color: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    titleKh: "ការគាំទ្រពី Mentor",
    title: "Mentor Partnership",
    descKh: "ទទួលបានការណែនាំ feedback loop ពី practitioners ដែលមានបទពិសោធន៍ industry ពិត",
    desc: "Guidance and feedback from active industry practitioners.",
    icon: "🤝",
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
];

export const milestones = [
  { year: "2022", event: "ADUTI Learning ត្រូវបានបង្កើតឡើង", eventEn: "ADUTI Learning founded" },
  { year: "2023", event: "សិស្ស 500+ ដំបូងបញ្ចប់ Frontend path", eventEn: "First 500 students complete Frontend path" },
  { year: "2024", event: "បន្ថែម Backend & Fullstack roadmap", eventEn: "Backend & Fullstack roadmaps launched" },
  { year: "2025", event: "សិស្ស 2,400+ certificate ពេញ platform", eventEn: "2,400+ learners certified across all paths" },
];