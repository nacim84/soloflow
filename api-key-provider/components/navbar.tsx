"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, KeyRound } from "lucide-react";
import { useServerSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { CreditsBadge } from "@/components/credits-badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", authRequired: false },
  { href: "/#pricing", label: "Pricing", authRequired: false },
  { href: "/keys", label: "My Keys", authRequired: true },
  { href: "/services", label: "Services", authRequired: true },
  { href: "/usage", label: "Usage", authRequired: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useServerSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!user;

  const visibleLinks = navLinks.filter(
    (link) => !link.authRequired || isAuthenticated,
  );

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block">Key API Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 border-b-2 border-transparent py-1",
                  isActiveLink(link.href)
                    ? "text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "text-zinc-600 hover:text-zinc-900 hover:border-indigo-600 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:border-indigo-400",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Credits Badge (only if authenticated) */}
          {isAuthenticated && (
            <>
              <CreditsBadge />
              <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />
            </>
          )}

          <ThemeToggle />

          {/* Divider (Desktop only) */}
          <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />

          {/* Auth State */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="shadow-lg">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 max-w-[300px] sm:w-[300px] pr-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-6 px-1">
                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-2">
                  {visibleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActiveLink(link.href)
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-3 pt-6 pr-6">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start shadow-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
