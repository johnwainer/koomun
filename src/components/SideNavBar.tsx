"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNavBar() {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    return pathname === href
      ? "flex items-center gap-3 px-4 py-3 bg-[#ffffff] text-[#111111] rounded-lg shadow-sm font-semibold translate-x-1 duration-150"
      : "flex items-center gap-3 px-4 py-3 text-[#646468] hover:text-[#1a1c1b] hover:bg-[#f4f3f1] transition-all rounded-lg";
  };

  return (
    <aside className="hidden lg:flex flex-col gap-2 p-4 h-screen w-64 fixed left-0 top-0 pt-20 border-r border-[#c3c6d7]/15 bg-[#faf9f7] text-sm font-medium tracking-wide z-40">
      <nav className="flex flex-col gap-1 mt-4">
        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          <span className="material-symbols-outlined">apps</span>
          <span>Comunidades</span>
        </Link>
        <Link href="/feed" className={getLinkClass("/feed")}>
          <span className="material-symbols-outlined">forum</span>
          <span>Feed</span>
        </Link>
        <Link href="/classroom" className={getLinkClass("/classroom")}>
          <span className="material-symbols-outlined">local_library</span>
          <span>Librería</span>
        </Link>
        <Link href="/calendar" className={getLinkClass("/calendar")}>
          <span className="material-symbols-outlined">calendar_today</span>
          <span>Calendario</span>
        </Link>

        
        <div className="my-2 border-t border-outline-variant/15 w-full"></div>
        
        <Link href="/studio" className={getLinkClass("/studio")}>
          <span className="material-symbols-outlined text-primary">team_dashboard</span>
          <span className="font-bold text-primary">Estudio de Creador</span>
        </Link>
      </nav>
      <div className="mt-auto pt-6 border-t border-outline-variant/15">
        <Link href="/upgrade" className="flex items-center justify-center w-full mb-4 py-3 bg-gradient-to-r from-primary-container to-primary text-on-primary-container rounded-full font-bold text-xs tracking-wider uppercase active:scale-95 transition-transform">
          Mejorar Plan
        </Link>
        <Link 
          href="/support"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
            pathname === "/support"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined flex-shrink-0 group-hover:scale-110 transition-transform">help</span>
          Soporte
        </Link>
      </div>
    </aside>
  );
}
