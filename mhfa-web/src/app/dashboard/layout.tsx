import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
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

  const userName = session.user.name || "Pengguna SUFA";
  const userEmail = session.user.email;
  const phone = (session.user as Record<string, any>).phone || "";
  const subtext = phone ? `No: ${phone}` : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="konseli"
        userName={userName}
        userEmail={userEmail}
        userSubtext={subtext}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          role="konseli"
          userName={userName}
          userEmail={userEmail}
          userSubtext={subtext}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-surface-dim">
          {children}
        </main>
      </div>
    </div>
  );
}
