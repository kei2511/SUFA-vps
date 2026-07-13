import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function KonselorLayout({
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
  if (role !== "Konselor" && role !== "Admin") {
    redirect("/dashboard");
  }

  const userName = session.user.name || "Konselor MHFA";
  const userEmail = session.user.email;
  const phone = (session.user as Record<string, any>).phone || "";
  const subtext = phone ? `No: ${phone}` : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="konselor"
        userName={userName}
        userEmail={userEmail}
        userSubtext={subtext}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          role="konselor"
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
