import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* Wrap the entire application with AuthProvider */}
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}