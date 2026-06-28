import Link from "next/link";

interface TopNavProps {
  title?: string;
  showSettings?: boolean;
}

export default function TopNav({
  title = "Layanan Kesehatan Jiwa",
  showSettings = true,
}: TopNavProps) {
  return (
    <header className="h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
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
          <span className="material-symbols-outlined text-on-surface-variant text-xl">
            settings
          </span>
        </Link>
      )}
    </header>
  );
}
