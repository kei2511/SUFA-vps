import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        userName="Admin MHFA"
        userEmail="admin@mhfa.go.id"
        userSubtext="Super Admin"
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 bg-surface-dim">
          {children}
        </main>
        <BottomNav role="admin" />
      </div>
    </div>
  );
}
