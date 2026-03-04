import { MessageSquareQuote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/components/constants/home-data";

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12 text-center">
        <Badge className="mb-3 border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <MessageSquareQuote className="mr-1.5 h-3 w-3" />
          មតិយោបល់
        </Badge>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
          អ្នករៀននិយាយ{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            ដូចម្តេច?
          </span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70"
          >
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/8">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}