import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin User - SoloFlow",
  description: "Administration des utilisateurs pour SoloFlow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}