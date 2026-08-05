"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "./Sidebar";

interface TopNavProps {
  title?: string;
  showSettings?: boolean;
  role?: "pasien" | "konseli" | "konselor" | "admin";
  userName?: string;
  userEmail?: string;
  userSubtext?: string;
}

export default function TopNav({
  title = "Layanan Kesehatan Jiwa",
  showSettings = true,
  role,
  userName,
  userEmail,
  userSubtext,
}: TopNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          {role && (
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl block">
                menu
              </span>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg filled">
              health_and_safety
            </span>
          </div>
          <span className="font-heading font-semibold text-primary text-sm">
            {title}
          </span>
        </div>
        {showSettings && (
          <Link
            href="/profile"
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl block">
              settings
            </span>
          </Link>
        )}
      </header>

      {/* Mobile Drawer Overlay */}
      {role && isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative flex flex-col bg-surface-container-lowest w-[280px] h-full shadow-2xl transition-transform duration-300 transform translate-x-0">
            <Sidebar
              role={role}
              userName={userName}
              userEmail={userEmail}
              userSubtext={userSubtext}
              isMobile={true}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
