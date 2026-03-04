import { Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { faqs } from "@/components/constants/home-data";

export function FAQSection() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/80 py-20 dark:border-white/8 dark:bg-slate-950/50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge className="mb-3 border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Layers3 className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            សំណួរ{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ញឹកញាប់
            </span>
          </h2>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-slate-200 dark:divide-white/10">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-transform duration-200 group-open:rotate-45 dark:border-white/15 dark:text-slate-400">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}