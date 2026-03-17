import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";
import { Noto_Sans_Khmer } from "next/font/google";

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-khmer",
});

export const metadata: Metadata = {
  title: "CodeGrowthKH — Practical IT Education",
  description: "Learn programming lanaguage with a roadmap built for real product work. Frontend, Backend, DevOps, and more.",
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icon.png?v=2",
    apple: { url: "/apple-icon.png?v=2", type: "image/png", sizes: "512x512" },
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSansKhmer.variable} ${notoSansKhmer.className}`}>
        <QueryProvider>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            themes={["light", "dark", "aurora", "sakura"]}
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
