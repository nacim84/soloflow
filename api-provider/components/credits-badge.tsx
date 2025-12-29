"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getUserTotalCredits } from "@/app/actions/api-key-actions";
import { cn } from "@/lib/utils";

export function CreditsBadge() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCredits = async () => {
    const result = await getUserTotalCredits();
    if (result.success && result.data) {
      setBalance(result.data.totalBalance);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCredits();

    // Refresh every 30 seconds
    const interval = setInterval(loadCredits, 30000);

    // Listen for custom event to force refresh after credit purchase
    const handleCreditsUpdate = () => {
      loadCredits();
    };
    window.addEventListener("credits-updated", handleCreditsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("credits-updated", handleCreditsUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || balance === null) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
        <CreditCard className="h-4 w-4 text-zinc-400 animate-pulse" />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          ...
        </span>
      </div>
    );
  }

  const isLow = balance < 100;
  const isVeryLow = balance < 20;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors",
        isVeryLow
          ? "bg-red-100 dark:bg-red-950"
          : isLow
            ? "bg-orange-100 dark:bg-orange-950"
            : "bg-emerald-100 dark:bg-emerald-950",
      )}
    >
      <CreditCard
        className={cn(
          "h-4 w-4",
          isVeryLow
            ? "text-red-600 dark:text-red-400"
            : isLow
              ? "text-orange-600 dark:text-orange-400"
              : "text-emerald-600 dark:text-emerald-400",
        )}
      />
      <span
        className={cn(
          "text-sm font-semibold",
          isVeryLow
            ? "text-red-700 dark:text-red-300"
            : isLow
              ? "text-orange-700 dark:text-orange-300"
              : "text-emerald-700 dark:text-emerald-300",
        )}
      >
        {balance.toLocaleString()}
      </span>
      <span
        className={cn(
          "text-xs",
          isVeryLow
            ? "text-red-600 dark:text-red-400"
            : isLow
              ? "text-orange-600 dark:text-orange-400"
              : "text-emerald-600 dark:text-emerald-400",
        )}
      >
        crédits
      </span>
    </div>
  );
}
