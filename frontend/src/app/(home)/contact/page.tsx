"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const GOALS = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Mobile Developer",
  "DevOps / Cloud",
  "មិនទាន់ដឹង",
];

const EXPERIENCE_LEVELS = [
  "ថ្មីទាំងស្រុង (Zero)",
  "HTML/CSS ដឹងខ្លះ",
  "JavaScript ដឹងខ្លះ",
  "Framework ដឹងខ្លះ",
  "Intermediate",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="space-y-10 pb-16 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden p-7  md:p-12 ">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/10 via-violet-400/10 to-pink-300/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <Badge className="mb-4 border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            <MessageCircle className="mr-1.5 h-3 w-3" />
            ទំនាក់ទំនងមកយើង
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white">
            ជ្រើស{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Learning Path
            </span>{" "}
            ត្រឹមត្រូវ
            <br />
            ជាមួយ Mentor ណែនាំ
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
            ប្រាប់ goal និង skill level — Mentor នឹង propose course sequence
            និង roadmap ដែលត្រូវជាមួយ timeline របស់អ្នក ក្នុង{" "}
            <strong className="text-slate-800 dark:text-slate-200">24 ម៉ោង</strong>។
          </p>

          {/* Quick trust row */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "ឥតគិតថ្លៃ",
              "ឆ្លើយក្នុង 24h",
              "Mentor ពិតប្រាកដ",
              "ជាភាសាខ្មែរ",
            ].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        {/* ── Contact Form ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          {/* Form header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-6 py-5 dark:border-white/8 dark:from-blue-500/10 dark:to-violet-500/5">
            <h2 className="font-bold text-slate-900 dark:text-white">
              📩 ផ្ញើសារមកយើង
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Share your objective, current experience, and preferred timeline.
            </p>
          </div>

          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  សារត្រូវបានផ្ញើហើយ! 🎉
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Mentor នឹង reply ក្នុង 24 ម៉ោង — Mon–Sat, 8am–8pm
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="rounded-full"
              >
                ផ្ញើម្តងទៀត
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Name + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    ឈ្មោះ / Full Name
                  </Label>
                  <Input
                    id="name"
                    required
                    placeholder="ឧ. Dara Chan"
                    className="border-slate-200 bg-slate-50 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email / Telegram
                  </Label>
                  <Input
                    id="email"
                    required
                    placeholder="you@example.com ឬ @username"
                    className="border-slate-200 bg-slate-50 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/8"
                  />
                </div>
              </div>

              {/* Goal selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  🎯 Career Goal
                </Label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setSelectedGoal(g)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        selectedGoal === g
                          ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-blue-400/50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience level selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  📊 Current Level
                </Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        selectedLevel === lvl
                          ? "border-violet-500 bg-violet-600 text-white shadow-sm shadow-violet-500/30"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-violet-400/50"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  💬 Message
                </Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="ប្រាប់យើងអំពី: ពេលវេលាទំនេរ/សប្តាហ៍, target timeline, course ដែលចាប់អារម្មណ៍, ឬ សំណួរផ្សេងៗ..."
                  className="resize-none border-slate-200 bg-slate-50 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/8"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:from-blue-500 hover:to-violet-500"
              >
                <Send className="mr-2 h-4 w-4" />
                ផ្ញើសារ / Submit Request
              </Button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                <Clock className="mr-1 inline h-3 w-3" />
                {responseTime.value} • {responseTime.sub}
              </p>
            </form>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">
          {/* Direct contacts */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-white/8">
              <h3 className="font-bold text-slate-900 dark:text-white">📬 ទំនាក់ទំនងផ្ទាល់</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/8">
              {directContacts.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span className="text-2xl leading-none">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {item.labelKh} / {item.label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.value}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Response time card */}
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {responseTime.label}
              </p>
              <p className="font-bold text-slate-900 dark:text-white">{responseTime.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{responseTime.sub}</p>
            </div>
          </div>

          {/* Social channels */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-white/8">
              <h3 className="font-bold text-slate-900 dark:text-white">🌐 Community & Channels</h3>
            </div>
            <div className="space-y-3 p-4">
              {contactChannels.map((ch) => (
                <a
                  key={ch.title}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/8 dark:bg-white/5"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${ch.color} text-lg text-white shadow-sm`}
                  >
                    {ch.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {ch.titleKh}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ch.helper}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-6 text-center">
          <Badge className="mb-3 border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Sparkles className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
            សំណួរ{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              ញឹកញាប់
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Common questions before enrollment
          </p>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-white/8 dark:border-white/10 dark:bg-slate-900/70">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-7 py-12 text-center text-white shadow-2xl shadow-blue-600/20 md:py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative space-y-4">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            ត្រៀមមួយ? ចាប់ផ្តើម{" "}
            <span className="text-yellow-300">ឥតគិតថ្លៃ</span> ថ្ងៃនេះ
          </h2>
          <p className="mx-auto max-w-md text-blue-100">
            ចុះឈ្មោះ Free — courses, roadmap, mentor support ជាភាសាខ្មែរ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-blue-700 shadow-xl transition-all hover:scale-[1.02] hover:bg-blue-50"
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
              <Link href="/courses">
                មើល Courses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FAQItem({
  faq,
  defaultOpen = false,
}: {
  faq: { question: string; questionEn: string; answer: string };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{faq.question}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{faq.questionEn}</p>
        </div>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-transform duration-200 dark:border-white/15 dark:text-slate-500 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-white/8 dark:bg-white/3">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export const contactChannels = [
  {
    title: "Telegram Community",
    titleKh: "សហគមន៍ Telegram",
    value: "@aduti_learning",
    helper: "ចូលរួម channel — សំណួរ, code review, updates",
    helperEn: "Join our main community channel for Q&A and updates",
    icon: "✈️",
    href: "https://t.me/aduti_learning",
    color: "from-blue-500 to-sky-400",
  },
  {
    title: "Facebook Page",
    titleKh: "ទំព័រ Facebook",
    value: "ADUTI Learning",
    helper: "Follow ដើម្បីទទួល course updates & tips",
    helperEn: "Follow for course announcements and learning tips",
    icon: "📘",
    href: "https://facebook.com/adutilearning",
    color: "from-indigo-500 to-blue-500",
  },
  {
    title: "YouTube Channel",
    titleKh: "YouTube Channel",
    value: "ADUTI Learning",
    helper: "Free lessons, tutorials, career advice ជាភាសាខ្មែរ",
    helperEn: "Free Khmer-language tutorials and career content",
    icon: "▶️",
    href: "https://youtube.com/@adutilearning",
    color: "from-red-500 to-rose-400",
  },
];

export const directContacts = [
  {
    icon: "✉️",
    label: "Email",
    labelKh: "អ៊ីម៉ែល",
    value: "hello@adutilearning.com",
    href: "mailto:hello@adutilearning.com",
  },
  {
    icon: "📞",
    label: "Phone / Telegram",
    labelKh: "ទូរស័ព្ទ",
    value: "+855 12 345 678",
    href: "tel:+85512345678",
  },
  {
    icon: "📍",
    label: "Location",
    labelKh: "ទីតាំង",
    value: "Phnom Penh, Cambodia",
    href: "https://maps.google.com/?q=Phnom+Penh",
  },
];

export const faqs = [
  {
    question: "តើ ADUTI Learning ជាអ្វី?",
    questionEn: "What is ADUTI Learning?",
    answer:
      "ADUTI Learning គឺជាវេទិកា ed-tech ជាភាសាខ្មែរ ដែលផ្តោតលើ Software Development — courses, roadmap, mentor support ពី zero ដល់ developer ពិត។",
  },
  {
    question: "តើខ្ញុំត្រូវចំណាយប្រាក់ទេ?",
    questionEn: "Is it free?",
    answer:
      "អ្នកអាចចុះឈ្មោះ Free ហើយចូលប្រើ courses និង roadmap ភ្លាមៗ។ មានជម្រើស premium សម្រាប់ mentor 1-on-1 និង project feedback។",
  },
  {
    question: "ខ្ញុំមិនមានបទពិសោធន៍ — អាចចាប់ផ្តើមបានទេ?",
    questionEn: "No experience needed?",
    answer:
      "បាន! Roadmap ចាប់ពី HTML & CSS ដំបូងបំផុត ហើយ mentor guide អ្នកជាជំហានៗ គ្មានការស្ដីបន្ទោស ឬ judging ទេ។",
  },
  {
    question: "Certificate ទទួលស្គាល់ដោយណា?",
    questionEn: "Is the certificate recognized?",
    answer:
      "Certificate ពី ADUTI Learning អ្នកអាចដាក់លើ LinkedIn/CV បានភ្លាមៗ។ ក្រុមហ៊ុន IT ក្នុង Cambodia ស្គាល់ platform យើង។",
  },
  {
    question: "Mentor support ដំណើរការដូចម្តេច?",
    questionEn: "How does mentor support work?",
    answer:
      "Mentor ឆ្លើយសំណួរ, review code weekly, និង ណែនាំ learning path ដែលត្រូវជាមួយ goal របស់អ្នក — តាម Telegram ឬ live session។",
  },
  {
    question: "ត្រូវរៀន ប៉ុន្មានម៉ោងក្នុងមួយអាទិត្យ?",
    questionEn: "How many hours per week?",
    answer:
      "យើងណែនាំ 5–7 ម៉ោងក្នុង 1 សប្តាហ៍។ Roadmap រចនាឲ្យ flexible — អ្នកអាចរៀនពេលល្ងាចឬ weekend ក៏បាន។",
  },
];

export const responseTime = {
  label: "ពេលវេលា response",
  labelEn: "Response Time",
  value: "ក្នុង 24 ម៉ោង",
  valueEn: "Within 24 hours",
  sub: "Mon – Sat, 8am – 8pm (GMT+7)",
};