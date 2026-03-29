import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background h-screen overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto px-10 py-8 bg-background">
        {children}
      </main>
    </div>
  );
}
