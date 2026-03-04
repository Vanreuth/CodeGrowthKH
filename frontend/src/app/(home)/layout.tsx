import TopBar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-bshadow-sm">
        <TopBar />
      </header>

      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <Footer />
      </footer>
    </div>
  );
}