"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { learningCourseLinks } from "@/components/constants/roadmap-data";
import SectionHeader from "../section/SectionHeader";

type TechItem = {
  name: string;
  icon?: string;
  badge?: string;
  badgeClassName?: string;
  glow: string;
  href?: string;
};

const autoplayMs = 4200;
const progressTickMs = 120;
const courseLinkByTechName: Partial<Record<string, string>> = {
  HTML5: learningCourseLinks[0].href,
  CSS3: learningCourseLinks[1].href,
  JavaScript: learningCourseLinks[2].href,
  React: learningCourseLinks[3].href,
  Java: learningCourseLinks[5].href,
  "Spring Boot": learningCourseLinks[6].href,
  Git: learningCourseLinks[7].href,
};

const techCatalog: TechItem[] = [
  {
    name: "CSS3",
    icon: "/tech/css.png",
    glow: "rgba(37, 99, 235, 0.22)",
    href: courseLinkByTechName.CSS3,
  },
  {
    name: "JavaScript",
    icon: "/tech/javascript.png",
    glow: "rgba(250, 204, 21, 0.24)",
    href: courseLinkByTechName.JavaScript,
  },
  {
    name: "TypeScript",
    icon: "/tech/typescript.png",
    glow: "rgba(37, 99, 235, 0.22)",
  },
  {
    name: "React",
    icon: "/tech/reactjs.png",
    glow: "rgba(34, 211, 238, 0.2)",
    href: courseLinkByTechName.React,
  },
  {
    name: "Node.js",
    icon: "/tech/nodejs.png",
    glow: "rgba(34, 197, 94, 0.22)",
  },
  {
    name: "Python",
    icon: "/tech/python.png",
    glow: "rgba(59, 130, 246, 0.2)",
  },
  {
    name: "C++",
    icon: "/tech/cpp.png",
    glow: "rgba(37, 99, 235, 0.18)",
  },
  {
    name: "Java",
    icon: "/tech/java.svg",
    glow: "rgba(239, 68, 68, 0.16)",
    href: courseLinkByTechName.Java,
  },
  {
    name: "PHP",
    icon:"/tech/php.png",
    glow: "rgba(99, 102, 241, 0.18)",
  },
  {
    name: "Swift",
    icon: "/tech/swift.png",
    glow: "rgba(249, 115, 22, 0.18)",
  },
  {
    name: "Kotlin",
    icon: "/tech/kotlin.png",
    glow: "rgba(139, 92, 246, 0.18)",
  },
  {
    name: "HTML5",
    icon: "/tech/html.png",
    glow: "rgba(249, 115, 22, 0.22)",
    href: courseLinkByTechName.HTML5,
  },
  {
    name: "Dart",
    icon: "/tech/dart.png",
    glow: "rgba(6, 182, 212, 0.18)",
  },
  {
    name: "Go",
    icon:"/tech/go.png",
    glow: "rgba(34, 211, 238, 0.18)",
  },
  {
    name: "Spring Boot",
    icon: "/tech/spring.png",
    glow: "rgba(34, 197, 94, 0.2)",
    href: courseLinkByTechName["Spring Boot"],
  },
  {
    name: "MongoDB",
    icon: "/tech/mongodb.png",
    glow: "rgba(34, 197, 94, 0.18)",
  },
  {
    name: "Docker",
    icon: "/tech/docker.png",
    glow: "rgba(14, 165, 233, 0.22)",
  },
  {
    name: "Git",
    icon: "/tech/git.png",
    glow: "rgba(249, 115, 22, 0.2)",
    href: courseLinkByTechName.Git,
  },
  {
    name: "Figma",
    icon: "/tech/figma.png",
    glow: "rgba(217, 70, 239, 0.18)",
  },
  {
    name: "Redux",
    icon: "/tech/redux.png",
    glow: "rgba(124, 58, 237, 0.18)",
  },
  {
    name: "Tailwind",
    icon: "/tech/tailwind.png",
    glow: "rgba(6, 182, 212, 0.22)",
  },
  {
    name: "Three.js",
    icon: "/tech/threejs.svg",
    glow: "rgba(15, 23, 42, 0.16)",
  },
];

const techByName = Object.fromEntries(
  techCatalog.map((item) => [item.name, item] as const),
);

const techSlides: TechItem[][] = [
  [
    "CSS3",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "C++",
    "Java",
    "PHP",
    "Swift",
    "Kotlin",
    "TypeScript",
    "JavaScript",
    "CSS3",
    "HTML5",
    "Dart",
    "Go",
    "Kotlin",
    "Swift",
    "PHP",
  ].map((name) => techByName[name]),
  [
    "React",
    "TypeScript",
    "Node.js",
    "MongoDB",
    "Docker",
    "Java",
    "Spring Boot",
    "Tailwind",
    "Redux",
    "Three.js",
    "HTML5",
    "CSS3",
    "JavaScript",
    "Go",
    "Dart",
    "Figma",
    "Git",
    "Python",
    "React",
    "TypeScript",
  ].map((name) => techByName[name] ?? {
    name,
    badge: name.slice(0, 2),
    glow: "rgba(148, 163, 184, 0.18)",
  }),
];

function TechCard({
  item,
  active,
  delay,
}: {
  item: TechItem;
  active: boolean;
  delay: number;
}) {
  const cardInner = (
    <>
      <div className="relative flex h-[94px] w-[94px] items-center justify-center sm:h-[102px] sm:w-[102px]">
        <div
          className="techbar-card-glow absolute inset-[-8px] rounded-full blur-[18px] opacity-70 transition-opacity duration-300 group-hover:opacity-100 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${item.glow}, transparent 68%)`,
          }}
        />
        <div className="techbar-card-core relative flex h-full w-full items-center justify-center rounded-full transition-all duration-300 group-hover:-translate-y-1">
          <div
            className="techbar-card-sheen pointer-events-none absolute inset-[10px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95), rgba(255,255,255,0))",
            }}
          />
          {item.icon ? (
            <div className="relative h-[48px] w-[48px] sm:h-[54px] sm:w-[54px]">
              <Image
                src={item.icon}
                alt={item.name}
                fill
                className="object-contain"
                sizes="54px"
              />
            </div>
          ) : (
            <div
              className={cn(
                "relative z-10 flex h-[54px] w-[54px] items-center justify-center rounded-2xl text-base font-extrabold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]",
                item.badgeClassName ?? "techbar-fallback-badge",
              )}
            >
              {item.badge}
            </div>
          )}
        </div>
      </div>
      <span className="techbar-card-name text-center text-[15px] font-semibold tracking-tight transition-colors duration-300">
        {item.name}
      </span>
      {item.href ? (
        <span className="techbar-course-pill rounded-full px-2.5 py-1 text-[11px] font-semibold opacity-80 transition-all duration-300 group-hover:opacity-100">
          មើលវគ្គសិក្សា
        </span>
      ) : null}
    </>
  );

  const sharedClassName = cn(
    "group flex w-[108px] shrink-0 flex-col items-center gap-4 text-center transition-all duration-700 sm:w-[116px]",
    active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
    item.href ? "cursor-pointer" : "",
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={sharedClassName}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <article className={sharedClassName} style={{ transitionDelay: `${delay}ms` }}>
      {cardInner}
    </article>
  );
}

export function TechBar() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const increment = (progressTickMs / autoplayMs) * 100;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + increment;

        if (next < 100) return next;

        startTransition(() => {
          setActiveSlide((prev) => (prev + 1) % techSlides.length);
        });
        return 0;
      });
    }, progressTickMs);

    return () => window.clearInterval(timer);
  }, [paused]);

  const goToSlide = (index: number) => {
    setProgress(0);
    startTransition(() => {
      setActiveSlide(index);
    });
  };

  const goPrev = () => {
    goToSlide(activeSlide === 0 ? techSlides.length - 1 : activeSlide - 1);
  };

  const goNext = () => {
    goToSlide((activeSlide + 1) % techSlides.length);
  };

  return (
    <section className="techbar-shell relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="techbar-orb absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="techbar-topline absolute inset-x-0 top-0 h-px" />
      </div>

      <div className="relative mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8">

        <SectionHeader
          title="ភាសា និងបច្ចេកវិទ្យាពេញនិយម"
          highlight="ក្នុងសហគមន៍"
          description="ស្វែងយល់អំពីភាសាកូដ និងបច្ចេកវិទ្យាដែលពេញនិយម និងត្រូវបានប្រើប្រាស់យ៉ាងទូលំទូលាយក្នុងសហគមន៍កូដ។"
        />

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button
            type="button"
            onClick={goPrev}
            className="techbar-nav-btn absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full lg:inline-flex"
            aria-label="Previous technologies"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="techbar-nav-btn absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full lg:inline-flex"
            aria-label="Next technologies"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {techSlides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0 px-2 sm:px-4">
                  <div className="overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex min-w-max items-start gap-5 px-1 sm:gap-6">
                    {slide.map((item, itemIndex) => (
                      <TechCard
                        key={`${slideIndex}-${item.name}-${itemIndex}`}
                        item={item}
                        active={slideIndex === activeSlide}
                        delay={itemIndex * 55}
                      />
                    ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {techSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  "techbar-dot h-2.5 rounded-full transition-all duration-300",
                  index === activeSlide
                    ? "techbar-dot-active w-12"
                    : "w-2.5",
                )}
                aria-label={`Go to technology slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="mx-auto mt-4 w-36 sm:w-44">
            <Progress value={progress} className="techbar-progress h-1.5" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={goPrev}
              className="techbar-nav-btn inline-flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Previous technologies"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="techbar-nav-btn inline-flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Next technologies"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
