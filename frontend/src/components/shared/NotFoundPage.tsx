"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
	return (
		<main className="not-found-shell relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-12">

			{/* Background grid */}
			<div className="not-found-grid pointer-events-none absolute inset-0 -z-10" />

			{/* Radial glow */}
			<div className="not-found-glow pointer-events-none absolute inset-0 -z-10" />

			<div className="w-full max-w-2xl">

				{/* Brand pill */}
				<div className="mb-10 flex justify-center">
					<Link
						href="/"
						className="not-found-brand-chip group inline-flex items-center gap-3 rounded-full px-5 py-3 shadow-lg backdrop-blur transition"
					>
						<div className="not-found-logo-frame relative h-10 w-10 shrink-0 overflow-hidden rounded-xl p-1.5">
							<Image
								src="/growth.png"
								alt="CodeGrowthKH"
								fill
								className="object-contain p-1 transition-transform duration-300 group-hover:scale-110"
								sizes="40px"
							/>
						</div>
						<div className="leading-none">
							<p className="not-found-brand-name bg-clip-text text-sm font-bold tracking-tight text-transparent">
								CodeGrowthKH
							</p>
							<p className="not-found-brand-tagline mt-0.5 text-xs">
								រៀនកូដជាភាសាខ្មែរ
							</p>
						</div>
					</Link>
				</div>

				{/* 404 hero */}
				<div className="relative mb-10 text-center">
					<p
						className="not-found-watermark select-none text-[10rem] font-black leading-none tracking-tighter sm:text-[13rem]"
						aria-hidden="true"
					>
						404
					</p>
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
						<span className="not-found-badge rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
							Page Not Found
						</span>
						<h1 className="not-found-title text-2xl font-bold sm:text-3xl">
							រកមិនឃើញទំព័រនេះទេ
						</h1>
						<p className="not-found-body max-w-sm text-sm leading-7">
							ទំព័រនេះអាចត្រូវបានលុប ផ្លាស់ប្តូរ URL
							ឬអ្នកបានវាយអាសយដ្ឋានខុស
						</p>
					</div>
				</div>

				{/* Tip cards */}
				<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
					{[
						{
							icon: "🔗",
							title: "ត្រួតពិនិត្យ URL",
							desc: "ពិនិត្យថាអ្នកបានវាយអក្សរ និងសញ្ញា / ត្រឹមត្រូវ",
						},
						{
							icon: "🏠",
							title: "ទំព័រដើម",
							desc: "ត្រឡប់ទៅ Home ហើយចូលទំព័រដែលចង់បាន",
						},
						{
							icon: "🗺️",
							title: "Roadmap",
							desc: "ជ្រើសរើសផ្លូវរៀនដែលសមស្របសម្រាប់អ្នក",
						},
					].map((tip) => (
						<div
							key={tip.title}
							className="not-found-tip-card rounded-2xl p-4"
						>
							<span className="text-2xl" aria-hidden="true">
								{tip.icon}
							</span>
							<p className="not-found-tip-title mt-2 text-sm font-semibold">
								{tip.title}
							</p>
							<p className="not-found-tip-desc mt-1 text-xs leading-5">
								{tip.desc}
							</p>
						</div>
					))}
				</div>

				{/* Actions */}
				<div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
					<Button
						asChild
						className="not-found-primary min-w-44 rounded-full font-semibold shadow-md"
					>
						<Link href="/">
							<Home className="h-4 w-4" />
							ទំព័រដើម
						</Link>
					</Button>

					<Button
						asChild
						variant="outline"
						className="not-found-outline min-w-44 rounded-full bg-transparent"
					>
						<Link href="/roadmap">
							<Compass className="h-4 w-4" />
							មើល Roadmap
						</Link>
					</Button>

					<Button
						variant="ghost"
						className="not-found-ghost min-w-44 rounded-full"
						onClick={() => window.history.back()}
					>
						<ArrowLeft className="h-4 w-4" />
						ត្រឡប់ក្រោយ
					</Button>
				</div>

				<p className="not-found-quick mt-8 text-center text-xs">
					សាកល្បងទំព័រទាំងនេះ៖{" "}
					<Link href="/courses" className="not-found-link transition hover:underline">
						Courses
					</Link>
					{" · "}
					<Link href="/roadmap" className="not-found-link transition hover:underline">
						Roadmap
					</Link>
					{" · "}
					<Link href="/about" className="not-found-link transition hover:underline">
						About
					</Link>
				</p>
			</div>
		</main>
	);
}
