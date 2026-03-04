import { stats } from "@/components/constants/home-data";

export function StatsBar() {
  return (
    <section className="border-y border-slate-100/80 bg-white/70 backdrop-blur-sm dark:border-white/8 dark:bg-slate-900/50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 divide-x divide-y divide-slate-100/80 dark:divide-white/8 lg:grid-cols-4 lg:divide-y-0">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 py-9 text-center"
          >
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              {s.value}
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {s.label}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{s.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}