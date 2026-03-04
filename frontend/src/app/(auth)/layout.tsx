import TopBar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
			<header className="sticky top-0 z-50">
				<TopBar />
			</header>

			<main className="flex-1">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex min-h-[70vh] items-center justify-center py-10 sm:py-14">
						{children}
					</div>
				</div>
			</main>

			<footer className="border-t border-slate-200 dark:border-slate-800">
				<Footer />
			</footer>
			<Toaster />
		</div>
	);
}
