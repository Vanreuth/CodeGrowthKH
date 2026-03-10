import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { features } from "@/components/constants/home-data";

export function WhySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12 text-center">
        <Badge className="mb-3 border-indigo-200/60 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Zap className="mr-1.5 h-3 w-3" />
          ហេតុអ្វីបានជាជ្រើសរើស GrowCodeKh?
        </Badge>
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">
          បទពិសោធន៍{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            រៀន
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          ពន្យល់ជាខ្មែរ — Build project​ ពិត — Roadmap ច្បាស់ — Support សកម្ម
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div
              className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-3xl shadow-lg ${f.shadow}`}
            >
              {f.emoji}
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {f.description}
            </p>
            {/* Animated bottom accent */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${f.color} transition-all duration-500 group-hover:w-full`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}