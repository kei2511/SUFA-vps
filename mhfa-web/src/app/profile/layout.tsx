import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfileLayout({
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

  const role = ((session.user as Record<string, any>).role || "Pasien").toLowerCase() as "pasien" | "konselor" | "admin";
  const userName = session.user.name || "Pengguna MHFA";
  const userEmail = session.user.email;
  const nik = (session.user as Record<string, any>).nik || "";
  const subtext = nik ? `NIK: ${nik}` : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        userSubtext={subtext}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          role={role}
          userName={userName}
          userEmail={userEmail}
          userSubtext={subtext}
        />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 bg-surface-dim">
          {children}
        </main>
        <BottomNav role={role} />
      </div>
    </div>
  );
}
