import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/session-provider";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const locales = ['fr', 'en'];

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  // Await params in Next.js 16+
  const {locale} = await params;

  // We can't use useTranslations in generateMetadata, so we use direct import
  const messages = await import(`../../messages/${locale}.json`);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  // Await params in Next.js 16+
  const {locale} = await params;

  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Fetch messages for next-intl
  const messages = await getMessages();

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
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}
