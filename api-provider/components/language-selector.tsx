"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const changeLanguage = (newLocale: string) => {
    // Save locale preference in cookie (30 days)
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 30 });

    startTransition(() => {
      // Remove current locale from pathname and add new locale
      const segments = pathname.split('/').filter(Boolean);
      const currentLocaleIndex = segments.findIndex(seg => ['fr', 'en'].includes(seg));

      if (currentLocaleIndex !== -1) {
        segments[currentLocaleIndex] = newLocale;
      } else {
        segments.unshift(newLocale);
      }

      const newPath = `/${segments.join('/')}`;
      router.push(newPath);
      router.refresh();
    });

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 gap-2 px-3 transition-all duration-200",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            "focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400",
            isPending && "opacity-50 cursor-wait"
          )}
          disabled={isPending}
          aria-label="Select language"
        >
          <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentLanguage.code.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "min-w-[160px] p-1",
          "bg-white dark:bg-slate-900",
          "border border-slate-200 dark:border-slate-800",
          "shadow-lg"
        )}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer",
              "transition-all duration-200",
              "focus:outline-none",
              locale === language.code
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
              isPending && "opacity-50 pointer-events-none"
            )}
          >
            <span className="text-lg" aria-hidden="true">
              {language.flag}
            </span>
            <span className="flex-1 text-sm">{language.name}</span>
            {locale === language.code && (
              <svg
                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
