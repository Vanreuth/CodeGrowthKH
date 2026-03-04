import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AVATAR_INITIALS = ["SR", "DM", "SC", "KP", "MH"];

export function CTASection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-6 py-16 text-center text-white shadow-2xl shadow-blue-600/20 md:px-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative space-y-5">
          <Badge className="border-white/30 bg-white/15 text-white">
            <Users className="mr-1.5 h-3 w-3" />
            ចូលរួមមួយជាមួយ 2,400+ learners ថ្ងៃនេះ
          </Badge>

          <h2 className="text-3xl font-extrabold md:text-5xl">
            ត្រៀមខ្លួនចង់ក្លាយជា
            <br />
            <span className="text-yellow-300">Developer</span> ហើយ?
          </h2>

          <p className="mx-auto max-w-lg text-blue-100">
            ចុះឈ្មោះ Free ថ្ងៃនេះ — ចូលប្រើ courses, roadmap, dashboard
            ដោយមិនចំណាយប្រាក់!
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
              <Link href="/courses">រកមើល Courses</Link>
            </Button>
          </div>

          {/* Social proof avatars */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {AVATAR_INITIALS.map((initials) => (
                <div
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-blue-400 to-violet-400 text-xs font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-100">
              <span className="font-semibold text-white">2,400+</span>{" "}
              អ្នករៀនបានចូលរួមហើយ
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}