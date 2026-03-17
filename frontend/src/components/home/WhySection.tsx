import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { features } from "@/components/constants/home-data";
import SectionHeader from "../section/SectionHeader";

export function WhySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader
        title="ហេតុអ្វីបានជាជ្រើសរើស"
        highlight="CodeGrowthKh?"
        description="យើងមិនមែនគ្រាន់តែផ្តល់វគ្គសិក្សា ពន្យល់ជាខ្មែរ Roadmap ច្បាស់  តែបង្កើតបទពិសោធន៍រៀនដែលពិតប្រាកដសម្រាប់អ្នក។"
      />

      <div className="grid gap-6 md:grid-cols-3 mt-12">
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