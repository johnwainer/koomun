"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    return pathname === href
      ? "flex flex-col items-center gap-1 text-[var(--color-primary)] font-bold scale-105 transition-transform"
      : "flex flex-col items-center gap-1 text-[#646468] hover:text-[#111111]";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#faf9f7] backdrop-blur-xl bg-opacity-95 z-50 flex items-center justify-around h-16 px-4 pb-2 border-t border-outline-variant/10">
      <Link href="/" className={getLinkClass("/")}>
        <span className="material-symbols-outlined">explore</span>
        <span className="text-[10px] uppercase tracking-wider">Explorar</span>
      </Link>
      <Link href="/dashboard" className={getLinkClass("/dashboard")}>
        <span className="material-symbols-outlined">apps</span>
        <span className="text-[10px] uppercase tracking-wider">Comunidades</span>
      </Link>
      <Link href="/feed" className={getLinkClass("/feed")}>
        <span className="material-symbols-outlined">forum</span>
        <span className="text-[10px] uppercase tracking-wider">Feed</span>
      </Link>
      <Link href="/classroom" className={getLinkClass("/classroom")}>
        <span className="material-symbols-outlined">local_library</span>
        <span className="text-[10px] uppercase tracking-wider">Librería</span>
      </Link>
      <Link href="/studio" className={getLinkClass("/studio")}>
        <span className="material-symbols-outlined text-primary">team_dashboard</span>
        <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Estudio</span>
      </Link>
    </div>
  );
}
