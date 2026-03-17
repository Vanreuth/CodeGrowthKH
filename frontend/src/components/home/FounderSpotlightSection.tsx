import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Mail, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { founderSpotlight } from "@/components/constants/home-data";

const actionIcons = [ArrowUpRight, BookOpen, Mail];

export function FounderSpotlightSection() {
  return (
    <section className="relative overflow-hidden py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-300/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute right-10 top-20 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            {founderSpotlight.badge}
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            អ្នកនៅពីក្រោយ{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              GrowCodeKh
            </span>
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            ស្គាល់បន្ថែមពីអ្នកបង្កើតវេទិកា ដែលកំពុងខិតខំបង្កើតមេរៀន និងបរិយាកាសសិក្សាដែលងាយយល់សម្រាប់អ្នកសិក្សាខ្មែរ។
          </p>
        </div>

        <div className="mt-12 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:p-10 dark:border-slate-800 dark:bg-slate-950/80">
          <div className="grid items-center gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 opacity-80 blur-[1px]" />
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-5 shadow-[0_18px_40px_rgba(37,99,235,0.28)] dark:border-slate-900">
                  <div className="absolute inset-4 rounded-full border border-white/20" />
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/95">
                    <Image
                      src={founderSpotlight.imageSrc}
                      alt={founderSpotlight.name}
                      width={220}
                      height={220}
                      className="h-[78%] w-[78%] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-blue-600 dark:text-blue-300">
                {founderSpotlight.eyebrow}
              </p>
              <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                {founderSpotlight.name}
              </h3>
              <div className="mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-500" />
              <p className="mt-5 text-lg font-semibold text-blue-700 dark:text-blue-300">
                {founderSpotlight.role}
              </p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                {founderSpotlight.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-6 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] hover:from-blue-700 hover:to-sky-600"
                >
                  <a
                    href={founderSpotlight.primaryAction.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {founderSpotlight.primaryAction.label}
                  </a>
                </Button>

                {founderSpotlight.secondaryActions.map((action, index) => {
                  const Icon = actionIcons[index];
                  const isExternal = action.href.startsWith("http") || action.href.startsWith("mailto:");

                  return (
                    <Button
                      key={action.label}
                      asChild
                      size="icon-lg"
                      variant="outline"
                      className="rounded-full border-blue-200 bg-white text-blue-600 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
                    >
                      {isExternal ? (
                        <a href={action.href} target="_blank" rel="noreferrer" aria-label={action.label}>
                          <Icon className="h-5 w-5" />
                        </a>
                      ) : (
                        <Link href={action.href} aria-label={action.label}>
                          <Icon className="h-5 w-5" />
                        </Link>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
