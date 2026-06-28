"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface SidebarProps {
  role: "pasien" | "konselor" | "admin";
  userName?: string;
  userEmail?: string;
  userSubtext?: string;
}

const menuItems = {
  pasien: [
    { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
    { label: "Riwayat Skrining", icon: "history", href: "/history" },
    { label: "Janji Temu", icon: "calendar_today", href: "#" },
    { label: "Pusat Bantuan", icon: "help_outline", href: "#" },
  ],
  konselor: [
    { label: "Dashboard", icon: "dashboard", href: "/konselor/dashboard" },
    { label: "Riwayat Skrining", icon: "history", href: "/konselor/patients" },
    { label: "Janji Temu", icon: "calendar_today", href: "#" },
    { label: "Pusat Bantuan", icon: "help_outline", href: "#" },
  ],
  admin: [
    { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
    { label: "Kuesioner", icon: "quiz", href: "/admin/questionnaires" },
    { label: "Panduan", icon: "menu_book", href: "/admin/guides" },
    { label: "Kontak Profesional", icon: "contacts", href: "/admin/contacts" },
    { label: "Invite Code", icon: "vpn_key", href: "/admin/invite-codes" },
    { label: "Manajemen User", icon: "group", href: "/admin/users" },
    { label: "Laporan", icon: "assessment", href: "/admin/reports" },
  ],
};

export default function Sidebar({
  role,
  userName = "Nama Pengguna",
  userEmail = "user@email.com",
  userSubtext,
}: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[role];

  return (
    <aside className="hidden md:flex w-[280px] min-h-screen bg-surface-container-lowest border-r border-outline-variant flex-col justify-between py-6 px-4 shrink-0">
      {/* User Profile */}
      <div>
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary truncate">
              {userName}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {userEmail}
            </p>
            {userSubtext && (
              <p className="text-xs text-text-muted truncate">{userSubtext}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
          await authClient.signOut();
          window.location.href = "/login";
        }}
        className="flex w-full items-center gap-3 px-6 py-2.5 text-sm font-medium text-status-error hover:bg-error-container/30 rounded-lg transition-all text-left cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Keluar
      </button>
    </aside>
  );
}
