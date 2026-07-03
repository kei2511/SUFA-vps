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
    return (
      <div className="p-8 max-w-xl mx-auto bg-surface-container rounded-xl mt-12 border border-outline space-y-4 text-on-surface">
        <h1 className="text-xl font-bold text-error">Debug Auth Failure</h1>
        <p className="text-sm">No session found on Vercel Server Side.</p>
        <pre className="p-4 bg-gray-900 text-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify({
            host: hostHeader,
            cookiePresent: !!cookieHeader,
            cookieKeys: cookieHeader ? cookieHeader.split(";").map(c => c.split("=")[0].trim()) : [],
            nodeEnv: process.env.NODE_ENV,
            betterAuthUrl: process.env.BETTER_AUTH_URL,
            vercelUrl: process.env.VERCEL_URL,
          }, null, 2)}
        </pre>
        <a href="/login" className="inline-block px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary-container">Kembali ke Login</a>
      </div>
    );
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
