"use client";

import { AppSidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import { usePathname } from "next/navigation";
import { generateBreadcrumbs } from "@/lib/breadcrumb-uttils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      redirectTo="/login?returnUrl=/dashboard"
      allowedRoles={["ADMIN"]}
      unauthorizedRedirectTo="/"
    >
      <SidebarProvider
        style={
          {
            "--sidebar-width": "250px",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
          <AppSidebar />
          <MainLayout>{children}</MainLayout>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { state } = useSidebar();
  const sidebarWidth =
    state === "expanded" ? "var(--sidebar-width)" : "var(--sidebar-width-icon)";

  return (
    <div
      className="flex flex-col flex-1 h-full transition-all duration-300"
      style={{ marginLeft: sidebarWidth }}
    >
      <Header sidebarWidth={sidebarWidth} />

      <main className="flex-1 pt-16 overflow-y-auto">
        <div className="p-4 px-8 mx-auto max-w-8xl">{children}</div>
      </main>

      <Footer />
    </div>
  );
};

const Header = ({ sidebarWidth }: { sidebarWidth: string }) => {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 border-b bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-muted/50 transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-border/50" />
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {crumb.isCurrentPage ? (
                    <BreadcrumbPage className="text-foreground font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="text-muted-foreground/50" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Topbar />
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-auto h-10 flex items-center justify-between px-6">
      <p className="text-sm text-muted-foreground">
        © 2024 Dashboard. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
        <Separator orientation="vertical" className="h-4" />
        <a
          href="#"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Terms of Service
        </a>
      </div>
    </footer>
  );
};
