"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Shield,
  HelpCircle,
  LogOut,
  BookOpen,
  Layers,
  TableOfContents,
  ChartBarBig,
  ChevronsUpDown,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const sidebarGroups = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        badge: null,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        badge: null,
      },
    ],
  },
  {
    title: "People",
    items: [
      { title: "Users", href: "/dashboard/users", icon: Users, badge: null },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Categories",
        href: "/dashboard/categories",
        icon: Layers,
        badge: null,
      },
      {
        title: "Courses",
        href: "/dashboard/courses",
        icon: BookOpen,
        badge: null,
      },
      {
        title: "Chapters",
        href: "/dashboard/chapters",
        icon: TableOfContents,
        badge: null,
      },
      {
        title: "Lessons",
        href: "/dashboard/lessons",
        icon: ChartBarBig,
        badge: null,
      },
      {
        title: "Documents",
        href: "/dashboard/documents",
        icon: FileText,
        badge: null,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
        badge: null,
      },
      {
        title: "Security",
        href: "/dashboard/security",
        icon: Shield,
        badge: null,
      },
      { title: "Help", href: "/dashboard/help", icon: HelpCircle, badge: null },
    ],
  },
];

interface SidebarProps {
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ onMobileClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActiveLink = (href: string): boolean => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLinkClick = () => onMobileClose?.();

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
        "dashboard-sidebar border-r border-sidebar-border/70",
        "[--sidebar-background:color-mix(in_oklch,var(--sidebar)_88%,var(--background))]",
        "[--sidebar-foreground:var(--sidebar-foreground)]",
        "[--sidebar-accent:color-mix(in_oklch,var(--sidebar-accent)_72%,transparent)]",
        "[--sidebar-accent-foreground:var(--sidebar-accent-foreground)]",
        "[--sidebar-border:color-mix(in_oklch,var(--sidebar-border)_72%,transparent)]",
      )}
    >
      {/* ─── Header / Logo ───────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border/70  py-3 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-12 rounded-2xl border border-transparent transition-all duration-200 hover:border-sidebar-border/70 hover:bg-sidebar-accent/60 data-[active=true]:bg-sidebar-accent"
            >
              <Link href="/dashboard" onClick={handleLinkClick}>
                {/* Logo mark */}

                <div className="flex items-center gap-2.5 px-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <img
                      src="/growth.png"
                      alt="CodeGrowthKH"
                      className="size-5 object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-foreground tracking-tight">
                      CodeGrowthKH
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Practical IT Education
                    </p>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ─── Navigation ──────────────────────────── */}
      <SidebarContent className="px-2 py-3 gap-0">
        {sidebarGroups.map((group, gi) => (
          <SidebarGroup key={group.title} className={gi > 0 ? "mt-4" : ""}>
            {/* Group label — hidden when collapsed */}
            <SidebarGroupLabel
              className={cn(
                "mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.18em]",
                "text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden",
              )}
            >
              {group.title}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const isActive = isActiveLink(item.href);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        onClick={handleLinkClick}
                        className={cn(
                          "h-10 gap-2.5 rounded-xl px-2.5",
                          "text-[13px] font-medium text-sidebar-foreground/70",
                          "transition-all duration-150",
                          "border border-transparent hover:border-sidebar-border/60 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground",
                          isActive && [
                            "border-primary/15 bg-primary/12 text-primary shadow-sm",
                            "hover:bg-primary/15 hover:text-primary",
                          ],
                        )}
                      >
                        <Link href={item.href}>
                          <Icon
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              isActive
                                ? "text-primary"
                                : "text-sidebar-foreground/45",
                            )}
                            strokeWidth={isActive ? 2 : 1.75}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>

                      {item.badge && (
                        <SidebarMenuAction className="pointer-events-none right-2">
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[9px] font-bold text-primary">
                            {item.badge}
                          </span>
                        </SidebarMenuAction>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ─── Footer / User ───────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border/70 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    "h-12 gap-3 rounded-2xl border border-transparent px-2",
                    "transition-all duration-200 hover:border-sidebar-border/60 hover:bg-sidebar-accent/55",
                    "ring-1 ring-transparent",
                  )}
                >
                  {/* Avatar with presence dot */}
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 rounded-xl ring-1 ring-sidebar-border/60">
                      <AvatarImage
                        src={user?.profilePicture || undefined}
                        alt={user?.username}
                      />
                      <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                        {user?.username?.slice(0, 2)?.toUpperCase() ?? "U"}
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
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className={cn(
                  "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl p-1.5",
                  "border-border/70 bg-background/95 shadow-2xl shadow-black/10 backdrop-blur-xl",
                )}
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={6}
              >
                {/* User info header */}
                <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
                  <Avatar className="h-9 w-9 rounded-xl ring-1 ring-border/60">
                    <AvatarImage
                      src={user?.profilePicture || undefined}
                      alt={user?.username}
                    />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      {user?.username?.slice(0, 2)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left">
                    <span className="text-[13px] font-semibold text-foreground">
                      {user?.username}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <div className="mx-1 mb-1 h-px bg-border/60" />

                <DropdownMenuItem
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-muted-foreground focus:bg-accent focus:text-foreground"
                >
                  <Settings
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  Settings
                </DropdownMenuItem>

                <div className="mx-1 my-1 h-px bg-border/60" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-red-500 focus:bg-red-500/10 focus:text-red-500"
                >
                  <LogOut className="size-4" strokeWidth={1.5} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail className="after:bg-sidebar-border/40 hover:after:bg-primary/40" />
    </Sidebar>
  );
}
