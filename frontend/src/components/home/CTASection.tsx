import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AVATAR_INITIALS = ["SR", "DM", "SC", "KP", "MH"];

export function CTASection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 px-6 py-20 text-center text-white shadow-2xl md:px-12">

        {/* background glow */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="relative space-y-6">

          {/* badge */}
          <Badge className="border-white/30 bg-white/10 text-white px-4 py-1 text-sm backdrop-blur">
            <Users className="mr-2 h-3.5 w-3.5" />
            100+ Developers កំពុងរៀន
          </Badge>

          {/* headline */}
          <h2 className="text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            ត្រៀមខ្លួនក្លាយជា
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Professional Developer
            </span>
          </h2>

          {/* description */}
          <p className="mx-auto max-w-xl text-lg text-blue-100">
            ចាប់ផ្តើមការសិក្សា Programming ជាមួយ Courses,
            Learning Roadmap និង Dashboard ដោយឥតគិតថ្លៃ។
          </p>

          {/* buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-10 text-blue-700 shadow-lg transition-all hover:scale-105 hover:bg-blue-50"
            >
              <Link href="/register">
                ចុះឈ្មោះ Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 text-white hover:bg-white/10"
            >
              <Link href="/courses">មើល Courses</Link>
            </Button>
          </div>

          {/* social proof */}
          <div className="flex flex-col items-center justify-center gap-3 pt-6">

            <div className="flex -space-x-3">
              {AVATAR_INITIALS.map((initials) => (
                <div
                  key={initials}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-br from-blue-400 to-purple-400 text-xs font-bold text-white shadow-md"
                >
                  {initials}
                </div>
              ))}
            </div>

            <p className="text-sm text-blue-100">
              <span className="font-semibold text-white">100+</span>{" "}
              អ្នករៀនបានចូលរួមហើយ 🚀
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}