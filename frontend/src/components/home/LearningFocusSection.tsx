import { ClipboardList, Rocket, ShieldCheck } from "lucide-react";

const focusItems = [
  {
    title: "ការរៀនតាមគម្រោង",
    description:
      "រៀនជំហាននីមួយៗដោយផ្អែកលើគម្រោងពិត ដើម្បីអនុវត្តបានភ្លាម និងចងចាំបានយូរ។",
    icon: ClipboardList,
    accent: "from-blue-500 to-cyan-500",
  },
  {
    title: "ការបង្កើនល្បឿនជំនាញ",
    description:
      "ផែនការសិក្សាមានរបៀបច្បាស់លាស់ ជួយឱ្យអ្នកឡើងកម្រិតជំនាញបានលឿន និងមានទិសដៅ។",
    icon: Rocket,
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "ការបង្កើតភាពជឿជាក់ខ្លួនឯង",
    description:
      "អនុវត្តជាមួយលំហាត់ និងការណែនាំជាប្រចាំ ដើម្បីបង្កើនទំនុកចិត្តក្នុងការសរសេរកូដ។",
    icon: ShieldCheck,
    accent: "from-indigo-500 to-blue-500",
  },
];

export function LearningFocusSection() {
  return (
    <section className="container-app py-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          គោលបំណងក្នុងការរៀនសម័យនេះ
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
          យើងជួយអ្នកបង្កើតជំនាញដែលអាចប្រើការងារពិត និងអភិវឌ្ឍជាបន្តបន្ទាប់ក្នុងពិភពការងារ IT។
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {focusItems.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="group relative overflow-visible rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70"
            >
              <div className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md dark:border-white/15 dark:bg-slate-800">
                <Icon className="h-4.5 w-4.5 text-blue-500" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-blue-600 dark:text-blue-400">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>

              <div
                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${item.accent} opacity-90`}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
