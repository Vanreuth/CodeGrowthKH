import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Quote,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="space-y-14 pb-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">

      {/* HERO */}
      <section className="overflow-hidden  md:p-12 lg:grid lg:grid-cols-2 lg:gap-12 ">

        {/* blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/10 via-violet-400/10 to-pink-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-gradient-to-tr from-emerald-400/8 to-cyan-300/8 blur-2xl" />

        {/* left content */}
        <div className="relative max-w-xl">

          <Badge className="mb-4 border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles className="mr-1.5 h-3 w-3" />
            អំពី GrowCodeKh
          </Badge>

          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl dark:text-white">
            យើងជួយអ្នករៀន ក្លាយជា{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              អ្នកជំនាញ IT
            </span>{" "}
            ពិតប្រាកដ
          </h1>

          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            GrowCodeKh គឺជាវេទិការៀនកូដ ជាភាសាខ្មែរ ដោយគ្មានការចំណាយ។ យើងផ្តោតការជួយបង្កើតការយល់ដឹងពីភាសាកូដនានាជាភាសាខ្មែរ ដើម្បីជួយអ្នកក្លាយជាអ្នកជំនាញ IT ដែលមានជំនាញ និងមានភាពរឹងមាំក្នុងទីផ្សារការងារ IT។

          </p>

          {/* quote */}
          <div className="mt-6 flex gap-3 rounded-xl border bg-slate-50 p-4 dark:bg-white/5">
            <Quote className="h-5 w-5 text-violet-400" />
            <p className="text-sm italic">
              “We don’t just teach syntax — we build engineers.”
            </p>
          </div>

        </div>

        {/* right visual */}
        <div className="mt-10 lg:mt-0">

          <div className="rounded-2xl border bg-slate-50 p-6 shadow-inner dark:bg-white/5">

            <p className="text-sm font-semibold text-slate-500 mb-4">
              Developer Learning Path
            </p>

            <div className="space-y-4 text-sm">

              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                HTML → CSS → JavaScript
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                React → Next.js
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                APIs → Databases
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                Production Deployment
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {platformStats.map((stat) => (
          <div
            key={stat.label}
            className="group flex flex-col items-center gap-2 rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/70"
          >

            <span className="text-3xl transition-transform group-hover:scale-110">
              {stat.icon}
            </span>

            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-2xl font-extrabold text-transparent">
              {stat.value}
            </span>

            <span className="text-sm font-semibold">{stat.label}</span>

            <span className="text-xs text-slate-400">{stat.labelEn}</span>

          </div>
        ))}
      </section>

      {/* TIMELINE */}
      <section className="rounded-2xl border bg-white p-8 dark:bg-slate-900/70">

        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-xl font-bold">GrowCodeKh  Journey</h2>
        </div>

        <div className="relative space-y-6">

          <div className="absolute left-[11px] top-2 h-full w-[2px] bg-gradient-to-b from-blue-400 via-violet-400 to-transparent opacity-60" />

          {milestones.map((m, i) => (
            <div
              key={m.year}
              className="relative flex gap-4 pl-7 hover:translate-x-1 transition"
            >

              <div className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[9px] text-white">
                {i + 1}
              </div>

              <div>

                <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">
                  {m.year}
                </span>

                <p className="text-sm mt-1">{m.event}</p>

              </div>

            </div>
          ))}
        </div>

      </section>

      {/* VALUES */}
      <section>

        <div className="text-center mb-8">

          <Badge className="mb-3">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Our Values
          </Badge>

          <h2 className="text-3xl font-bold">
            What We Believe
          </h2>

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {values.map((v) => (

            <div
              key={v.title}
              className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-lg transition dark:bg-slate-900/60"
            >

              <div className={`mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${v.color}`}>
                {v.icon}
              </div>

              <h3 className="font-bold">{v.titleKh}</h3>

              <p className="text-sm text-slate-500">{v.descKh}</p>

            </div>

          ))}

        </div>

      </section>

      {/* TEAM
      <section>

        <div className="mb-6">

          <Badge className="mb-3">
            <Users className="mr-1 h-3 w-3" />
            Mentor Team
          </Badge>

          <h2 className="text-3xl font-bold">
            Our Mentors
          </h2>

        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {teamHighlights.map((member) => (

            <div
              key={member.name}
              className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition dark:bg-slate-900/70"
            >

              <div className={`bg-gradient-to-r ${member.gradient} p-5 text-white`}>

                <p className="font-bold">{member.name}</p>
                <p className="text-xs">{member.roleKh}</p>

              </div>

              <div className="p-5 flex flex-col flex-1">

                <p className="text-sm text-slate-600 flex-1">
                  {member.summaryKh}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.topics.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-slate-100 px-2 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <a
                  href={member.linkedin}
                  className="mt-4 inline-flex items-center text-xs text-blue-600 hover:underline"
                >
                  LinkedIn
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>

              </div>

            </div>

          ))}

        </div>

      </section> */}

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 text-center text-white">

        <div className="space-y-4">

          <h2 className="text-3xl font-extrabold">
            Ready to start your journey?
          </h2>

          <p className="text-blue-100">
            Join thousands of learners learning software engineering in Khmer
          </p>

          <div className="flex justify-center gap-4">

            <Button asChild size="lg" className="bg-white text-blue-700">
              <Link href="/register">
                Register Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="ghost">
              <Link href="/roadmap">
                View Roadmap
              </Link>
            </Button>

          </div>

        </div>

      </section>

    </div>
  );
}

export const platformStats = [
  { value: "100+", label: "សិស្សសកម្ម", labelEn: "Active Learners", icon: "👨‍💻" },
  { value: "10+", label: "វគ្គសិក្សា", labelEn: "Courses", icon: "📚" },
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
  { year: "2026", event: "GrowCodeKh ត្រូវបានបង្កើតឡើង", eventEn: "GrowCodeKh founded" },
  { year: "2026", event: "សិស្ស 10+ ដំបូងបញ្ចប់ Frontend path", eventEn: "First 10students complete Frontend path" },
  { year: "2026", event: "បន្ថែម Backend & Fullstack roadmap", eventEn: "Backend & Fullstack roadmaps launched" },

];