"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted after component mounts to avoid hydration mismatch
  // This is the recommended pattern for next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync HTML class with theme changes
  useEffect(() => {
    if (!mounted) return;
    const currentTheme = resolvedTheme || theme || "light";
    const root = document.documentElement;
    
    // Safely remove classes - only remove if they exist
    if (root.classList.contains("light")) {
      root.classList.remove("light");
    }
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
    }
    
    // Add only the dark class if theme is dark
    if (currentTheme === "dark") {
      root.classList.add("dark");
    }
  }, [theme, resolvedTheme, mounted]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!mounted) return;
    const currentTheme = resolvedTheme || theme || "light";
    const next = currentTheme === "dark" ? "light" : "dark";
    setTheme(next);
    
    // Force immediate update for better UX
    setTimeout(() => {
      const root = document.documentElement;
      // Remove both light and dark classes first
      if (root.classList.contains("light")) {
        root.classList.remove("light");
      }
      if (root.classList.contains("dark")) {
        root.classList.remove("dark");
      }
      // Add only dark class if needed
      if (next === "dark") {
        root.classList.add("dark");
      }
    }, 0);
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Moon className="h-5 w-5" />
      </Button>
    );
  }

  const currentTheme = resolvedTheme || theme || "light";
  const isDark = currentTheme === "dark";

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      aria-label="Toggle theme" 
      onClick={toggle}
      type="button"
      style={{ cursor: 'pointer' }}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}


