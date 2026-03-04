"use client";

import type { ComponentType } from "react";
import { CheckIcon, Heart, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppTheme = "light" | "dark" | "aurora" | "sakura";

const themes: Array<{
  value: AppTheme;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "aurora", label: "Aurora", icon: Sparkles },
  { value: "sakura", label: "Sakura", icon: Heart },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentTheme: AppTheme =
    theme && themes.some((item) => item.value === theme as AppTheme)
      ? (theme as AppTheme)
      : "light";
  const TriggerIcon = themes.find((item) => item.value === currentTheme)?.icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <TriggerIcon className="h-[1.1rem] w-[1.1rem]" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = currentTheme === themeOption.value;

          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {themeOption.label}
              </span>
              {isActive ? <CheckIcon className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
