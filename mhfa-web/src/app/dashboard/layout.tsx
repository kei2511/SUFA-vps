import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  const hostHeader = requestHeaders.get("host") || requestHeaders.get("x-forwarded-host");
  
  console.log("[DEBUG DASHBOARD LAYOUT] Host:", hostHeader);
  console.log("[DEBUG DASHBOARD LAYOUT] Cookie present:", !!cookieHeader);
  if (cookieHeader) {
    console.log("[DEBUG DASHBOARD LAYOUT] Cookie value keys:", cookieHeader.split(";").map(c => c.split("=")[0].trim()));
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  console.log("[DEBUG DASHBOARD LAYOUT] Session found:", !!session);

  if (!session) {
    redirect("/login");
  }

  const userName = session.user.name || "Pengguna MHFA";
  const userEmail = session.user.email;
  const phone = (session.user as Record<string, any>).phone || "";
  const subtext = phone ? `No: ${phone}` : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="pasien"
        userName={userName}
        userEmail={userEmail}
        userSubtext={subtext}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 bg-surface-dim">
          {children}
        </main>
        <BottomNav role="pasien" />
      </div>
    </div>
  );
}
