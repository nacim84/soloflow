import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/session-provider";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Key API Manager",
  description:
    "Gestionnaire de clés API avec système de crédits - Stockez et gérez vos clés API en toute sécurité",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session server-side to pass to client components
  const session = await auth.api.getSession({ headers: await headers() });
  const sessionUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SessionProvider session={sessionUser}>
            <Navbar />
            {children}
          </SessionProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={true}
            toastOptions={{
              style: {
                zIndex: 9999,
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
