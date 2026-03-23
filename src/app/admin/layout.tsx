"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSuperAdmin() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        router.replace("/login");
        return;
      }

      // Consultar su perfil para ver el rol directamente
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
      if (profile?.role === "super_admin" || profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace("/dashboard");
      }
    }

    checkSuperAdmin();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      </div>
    );
  }

  // Helper para pintar el menú activo
  const getNavClass = (path: string) => {
    return pathname === path 
     ? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container-high text-primary font-bold shadow-sm transition-colors"
     : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-medium";
  };

  return (
    <div className="flex h-screen bg-[#faf9f7] text-[#1a1c1b]">
      {/* Sidebar Admin (Very clean & minimal) */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Core Admin</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className={getNavClass('/admin')}>
            <span className="material-symbols-outlined text-xl">group</span>
            Usuarios & Creadores
          </Link>
          <Link href="/admin/content" className={getNavClass('/admin/content')}>
            <span className="material-symbols-outlined text-xl">dataset</span>
            Gestor Comunidades
          </Link>
          <Link href="/admin/categories" className={getNavClass('/admin/categories')}>
            <span className="material-symbols-outlined text-xl">category</span>
            Categorías Globales
          </Link>
          <Link href="/admin/endpoints" className={getNavClass('/admin/endpoints')}>
            <span className="material-symbols-outlined text-xl">api</span>
            API Endpoints
          </Link>
          <Link href="/admin/logs" className={getNavClass('/admin/logs')}>
            <span className="material-symbols-outlined text-xl">history</span>
            Audit Logs
          </Link>
        </nav>
        
        <div className="p-4 border-t border-outline-variant/10">
          <button 
            onClick={async () => {
              await supabaseClient.auth.signOut();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-bold text-sm bg-surface-container-lowest border border-red-100"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
          <p className="mt-4 text-xs text-on-surface-variant text-center font-medium">v1.0.0 — Koomun Systems</p>
        </div>
      </aside>
      
      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Admin */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/10 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-sm uppercase tracking-widest font-black text-on-surface-variant">
            Infraestructura
          </h2>
          <div className="flex items-center gap-4">
             <button className="text-on-surface-variant hover:text-primary transition-colors">
               <span className="material-symbols-outlined">sync</span>
             </button>
             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 text-primary flex items-center justify-center">
               <span className="text-xs font-black">A</span>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
