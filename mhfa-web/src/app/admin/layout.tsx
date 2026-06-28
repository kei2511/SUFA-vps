import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Double check role
  const role = (session.user as Record<string, any>).role || "Pasien";
  if (role !== "Admin") {
    redirect("/dashboard");
  }

  const userName = session.user.name || "Admin MHFA";
  const userEmail = session.user.email;
  const subtext = "Super Admin";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        userName={userName}
        userEmail={userEmail}
        userSubtext={subtext}
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
