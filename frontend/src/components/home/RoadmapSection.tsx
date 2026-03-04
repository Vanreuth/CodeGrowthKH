"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Milestone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { roadmapPaths } from "@/components/constants/home-data";

type StepView = {
  title: string;
  description: string;
};

type PathView = {
  title: string;
  color: string;
  roleLabel: string;
  steps: StepView[];
};

function toStepView(step: string): StepView {
  const parts = step.split("—");
  if (parts.length > 1) {
    return {
      title: parts[0].trim(),
      description: parts.slice(1).join("—").trim(),
    };
  }
  return {
    title: step.trim(),
    description: "រៀនតាមជំហាននេះ ដើម្បីបង្កើនជំនាញបន្តិចម្តងៗ",
  };
}

function toRoleLabel(title: string): string {
  if (title.toLowerCase().includes("frontend")) return "មុខជំនាញគេហទំព័រ (Web Developer)";
  if (title.toLowerCase().includes("backend")) return "វិស្វករ Software (Software Engineer)";
  if (title.toLowerCase().includes("fullstack")) return "មុខជំនាញពេញលេញ (Full Stack)";
  return title;
}

export function RoadmapSection() {
  const paths = useMemo<PathView[]>(() => {
    const base = roadmapPaths.map((path) => ({
      title: path.title,
      color: path.color,
      roleLabel: toRoleLabel(path.title),
      steps: path.steps.map(toStepView),
    }));

    return [
      ...base,
      {
        title: "Cybersecurity Specialist",
        color: "from-slate-700 to-blue-700",
        roleLabel: "អ្នកជំនាញសុវត្ថិភាពប្រព័ន្ធ (Cybersecurity Specialist)",
        steps: [
          {
            title: "មូលដ្ឋាន Network និង Linux",
            description: "យល់ពី TCP/IP, Ports, Firewall និងការគ្រប់គ្រង Linux",
          },
          {
            title: "សិក្សា Security Tools",
            description: "អនុវត្តជាមួយ Nmap, Wireshark, Burp Suite និង OWASP Top 10",
          },
          {
            title: "Blue Team + Incident Response",
            description: "រៀន Monitoring, Detection និងវិធីដោះស្រាយបញ្ហាសុវត្ថិភាព",
          },
          {
            title: "Build Portfolio និង Certifications",
            description: "បង្កើត Project សុវត្ថិភាព និងត្រៀមប្រឡង Security Certificates",
          },
        ],
      },
    ];
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const activePath = paths[activeIndex];

  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 py-20 dark:from-slate-950 dark:via-blue-950/10 dark:to-violet-950/10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
          <Badge className="mb-3 border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            <Milestone className="mr-1.5 h-3 w-3" />
            ផ្លូវវិជ្ជាជីវៈ
          </Badge>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
            ជ្រើសរើស Roadmap
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            ជ្រើសផ្លូវមួយ រួចអនុវត្តតាមជំហានជាក់លាក់ ដើម្បីឆ្ពោះទៅគោលដៅអាជីពរបស់អ្នក
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {paths.map((path, index) => (
            <button
              key={path.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeIndex === index
                  ? `bg-gradient-to-r ${path.color} border-transparent text-white shadow`
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {path.roleLabel}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative pl-10">
            <div
              className={`absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b ${activePath.color} opacity-80`}
            />
            <div className="space-y-5">
              {activePath.steps.map((step, index) => (
                <div key={`${step.title}-${index}`} className="relative">
                  <span
                    className={`absolute -left-10 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${activePath.color} text-sm font-bold text-white shadow`}
                  >
                    {index + 1}
                  </span>
                  <article className="rounded-2xl border border-blue-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/roadmap"
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${activePath.color} px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90`}
            >
              ចាប់ផ្តើម Path នេះ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
