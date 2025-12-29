import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-sidebar-border bg-background">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
