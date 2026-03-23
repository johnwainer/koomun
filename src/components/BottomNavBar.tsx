"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    return pathname === href
      ? "flex items-center justify-center w-14 h-14 rounded-full text-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-110 transition-all font-black"
      : "flex items-center justify-center w-14 h-14 rounded-full text-[#646468] hover:text-[#111111] hover:bg-surface-container transition-all font-medium hover:scale-105";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#faf9f7] backdrop-blur-xl bg-opacity-95 z-50 flex items-center justify-evenly h-[72px] px-2 border-t border-outline-variant/10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <Link href="/dashboard" className={getLinkClass("/dashboard")}>
        <span className="material-symbols-outlined text-[28px]">apps</span>
      </Link>
      <Link href="/feed" className={getLinkClass("/feed")}>
        <span className="material-symbols-outlined text-[28px]">forum</span>
      </Link>
      <Link href="/classroom" className={getLinkClass("/classroom")}>
        <span className="material-symbols-outlined text-[28px]">local_library</span>
      </Link>
      <Link href="/studio" className={getLinkClass("/studio")}>
        <span className="material-symbols-outlined text-[28px]">team_dashboard</span>
      </Link>
    </div>
  );
}
