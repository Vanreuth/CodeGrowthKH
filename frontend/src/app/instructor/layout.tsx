"use client";

import Link from "next/link";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronsUpDown,
  GraduationCap,
  LogOut,
  PlusCircle,
  UserCircle2,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const instructorNav = [
  { title: "My Courses", href: "/instructor", icon: BookOpen },
  { title: "Create Course", href: "/instructor?tab=create", icon: PlusCircle },
  { title: "Stats", href: "/instructor?tab=stats", icon: BarChart3 },
  { title: "Profile", href: "/account", icon: UserCircle2 },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      redirectTo="/login?callbackUrl=/instructor"
      allowedRoles={["INSTRUCTOR", "ADMIN"]}
    >
      <SidebarProvider
        style={
          {
            "--sidebar-width": "255px",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_35%),linear-gradient(180deg,_hsl(var(--background)),_color-mix(in_oklch,var(--background)_88%,white))]">
          <InstructorSidebar />
          <InstructorShell>{children}</InstructorShell>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function InstructorSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  const activeTab = searchParams.get("tab");
  const isActiveLink = (href: string) => {
    const url = new URL(href, "http://localhost");
    const targetTab = url.searchParams.get("tab");

    if (url.pathname !== pathname) return false;
    if (!targetTab) return activeTab == null;
    return targetTab === activeTab;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Sign out failed");
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(
        "border-r border-sidebar-border/70",
        "[--sidebar-background:color-mix(in_oklch,var(--sidebar)_92%,white)]",
        "[--sidebar-accent:color-mix(in_oklch,var(--sidebar-accent)_72%,transparent)]",
      )}
    >
      <SidebarHeader className="border-b border-sidebar-border/70 p-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-12 rounded-2xl border border-transparent hover:border-sidebar-border/70 hover:bg-sidebar-accent/60"
            >
              <Link href="/instructor">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12">
                    <GraduationCap className="size-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold tracking-tight text-foreground">
                      Instructor Hub
                    </p>
                    <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      CodeGrowthKH
                    </p>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {instructorNav.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-xl px-2.5 text-[13px] font-medium transition-all",
                        "border border-transparent text-sidebar-foreground/70 hover:border-sidebar-border/60 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground",
                        isActive && "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-700"
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className={cn("size-4 shrink-0", isActive ? "text-emerald-600" : "text-sidebar-foreground/45")} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-12 rounded-2xl px-2">
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 rounded-xl ring-1 ring-sidebar-border/60">
                  <AvatarImage src={user?.profilePicture || undefined} alt={user?.username} />
                  <AvatarFallback className="rounded-xl bg-emerald-500/10 text-xs font-bold text-emerald-700">
                    {user?.username?.slice(0, 2)?.toUpperCase() ?? "IN"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[13px] font-semibold text-sidebar-foreground">
                  {user?.username}
                </span>
                <span className="truncate text-[10px] text-sidebar-foreground/50">
                  {user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-3.5 text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function InstructorShell({ children }: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar();
  const sidebarWidth = isMobile
    ? "0px"
    : state === "expanded"
      ? "var(--sidebar-width)"
      : "var(--sidebar-width-icon)";

  return (
    <div
      className="flex h-full flex-1 flex-col transition-all duration-300"
      style={{ marginLeft: sidebarWidth }}
    >
      <header
        className="fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-xl transition-all duration-300"
        style={{ left: isMobile ? 0 : sidebarWidth }}
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-muted/50" />
          <Separator orientation="vertical" className="h-6 bg-border/50" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">
                  Instructor Workspace
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Topbar />
      </header>

      <main className="flex-1 overflow-y-auto pt-16">
        <div className="mx-auto max-w-8xl p-4 px-8">{children}</div>
      </main>
    </div>
  );
}
