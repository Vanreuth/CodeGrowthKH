import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tips = [
  {
    title: "ជ្រើសរើសកម្រិតដែលសមស្រប",
    desc: "ចាប់ផ្តើមពី Beginner ប្រសិនបើអ្នកមិនទាន់ស្គាល់ programming",
  },
  {
    title: "ផ្តោតលើ Track មួយ",
    desc: "ប្រើ 4 សប្តាហ៍ក្នុង category មួយ មុននឹងប្តូរ",
  },
  {
    title: "Build ខណៈពេលរៀន",
    desc: "រៀបចំ project ជារៀងរាល់សប្តាហ៍",
  },
];

export function CourseGuidanceSection() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {/* Tips card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-bold text-foreground">របៀបជ្រើសរើសវគ្គសិក្សា</h3>
        <p className="mt-1 text-sm text-muted-foreground">ដំបូន្មានសម្រាប់ការចាប់ផ្តើម</p>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          {tips.map(({ title, desc }, i) => (
            <div key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-500/25">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />
        <div className="relative">
          <h3 className="text-lg font-bold">ត្រូវការជំនួយ?</h3>
          <p className="mt-1 text-sm text-violet-200">
            ទទួលបានផ្លូវសិក្សាដែលសមស្របនឹងគោលដៅរបស់អ្នក
          </p>
          <Button
            asChild
            className="mt-4 bg-white text-violet-700 hover:bg-violet-50 shadow-md"
          >
            <Link href="/contact" className="inline-flex items-center gap-1.5">
              ទំនាក់ទំនងអ្នកណែនាំ
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
