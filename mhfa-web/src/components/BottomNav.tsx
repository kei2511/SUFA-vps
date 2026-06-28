"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  role: "pasien" | "konselor" | "admin";
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  // Define mobile navigation items depending on the role
  const getNavItems = () => {
    switch (role) {
      case "pasien":
        return [
          { label: "Beranda", icon: "home", href: "/dashboard" },
          { label: "Riwayat", icon: "history", href: "/history" },
          { label: "Notifikasi", icon: "notifications", href: "/notifications" },
          { label: "Profil", icon: "person", href: "/profile" },
        ];
      case "konselor":
        return [
          { label: "Beranda", icon: "home", href: "/konselor/dashboard" },
          { label: "Pasien", icon: "group", href: "/konselor/patients" },
          { label: "Notifikasi", icon: "notifications", href: "/notifications" },
          { label: "Profil", icon: "person", href: "/profile" },
        ];
      case "admin":
      default:
        return [
          { label: "Beranda", icon: "home", href: "/admin/dashboard" },
          { label: "Kuesioner", icon: "quiz", href: "/admin/questionnaires" },
          { label: "Notifikasi", icon: "notifications", href: "/notifications" },
          { label: "Profil", icon: "person", href: "/profile" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex justify-around items-center h-16 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center w-20 py-1 transition-all ${
              isActive
                ? "text-primary scale-105"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isActive ? "filled" : ""}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
