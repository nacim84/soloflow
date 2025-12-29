"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter l'hydration mismatch en attendant que le composant soit monté
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rendre un état fixe côté serveur pour éviter l'hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9"
      aria-label="Toggle theme"
    >
      <Sun
        className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <Moon
        className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only">
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </span>
    </Button>
  );
}
