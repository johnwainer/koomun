"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        await fetch("/api/private/logger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'USER_LOGOUT',
            entity_type: 'auth',
            metadata: { method: 'TopNavBar' }
          })
        });
      }
    } catch(e) {}
    await supabaseClient.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
     async function checkUser() {
        const { data } = await supabaseClient.auth.getSession();
        if (data.session?.user) {
           setUser(data.session.user);
        }
        setLoading(false);
     }
     checkUser();
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf9f7] backdrop-blur-xl bg-opacity-80 border-b border-outline-variant/10">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 w-full font-medium">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            className="md:hidden flex items-center justify-center p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
            </div>
            <span className="text-xl font-bold text-[#1a1c1b] tracking-tighter">
              Koomun
            </span>
          </Link>
          <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full w-80">
            <span className="material-symbols-outlined text-outline text-sm mr-2">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Buscar comunidades..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link
              href="/creators"
              className={`text-xs font-black uppercase tracking-widest transition-all duration-300 px-3.5 py-1.5 rounded-full border flex items-center gap-1 ${
                pathname === "/creators" || pathname === "/leaderboard"
                  ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                  : "bg-transparent border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container/50"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
              Creadores
            </Link>
            <Link
              href="/"
              className={`font-semibold transition-colors duration-200 px-3 py-1 rounded-lg ${
                pathname === "/"
                  ? "text-on-surface bg-surface-container-high"
                  : "text-on-surface-variant font-normal hover:bg-surface-container-low"
              }`}
            >
              Explorar
            </Link>
            <Link
              href="/categories"
              className={`font-semibold transition-colors duration-200 px-3 py-1 rounded-lg ${
                pathname === "/categories"
                  ? "text-on-surface bg-surface-container-high"
                  : "text-on-surface-variant font-normal hover:bg-surface-container-low"
              }`}
            >
              Categorías
            </Link>
            <Link
              href="/trending"
              className={`font-semibold transition-colors duration-200 px-3 py-1 rounded-lg ${
                pathname === "/trending"
                  ? "text-on-surface bg-surface-container-high"
                  : "text-on-surface-variant font-normal hover:bg-surface-container-low"
              }`}
            >
              Tendencias
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/notifications" 
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors relative ${
                pathname === "/notifications" ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-[#f4f3f1] active:scale-95"
              }`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {pathname !== "/notifications" && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-surface-container-lowest"></span>}
            </Link>
            <Link 
              href="/chat" 
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors relative ${
                pathname === "/chat" ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-[#f4f3f1] active:scale-95"
              }`}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              {pathname !== "/chat" && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-surface-container-lowest"></span>}
            </Link>
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse ml-2"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/20 hover:border-primary/50 transition-colors overflow-hidden shrink-0 ml-2 bg-primary/10 text-primary font-black uppercase"
                  title="Mi Perfil"
                >
                  {user.user_metadata?.avatar_url ? (
                     <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                     user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0) : (user.email ? user.email.charAt(0) : "U")
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Cerrar Sesión"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 h-10 px-4 rounded-full border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-low transition-colors shrink-0 ml-2 text-sm font-bold text-on-surface"
                title="Iniciar Sesión"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span className="hidden md:inline">Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#faf9f7] border-b border-outline-variant/10 shadow-lg flex flex-col py-4 px-6 gap-4">
          <Link
            href="/creators"
            onClick={() => setIsMenuOpen(false)}
            className={`font-semibold flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-lg ${
              pathname === "/creators" || pathname === "/leaderboard"
                ? "text-primary bg-primary/10"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            Creadores Elite
          </Link>
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className={`font-semibold flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-lg ${
              pathname === "/"
                ? "text-on-surface bg-surface-container-high"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            Explorar
          </Link>
          <Link
            href="/categories"
            onClick={() => setIsMenuOpen(false)}
            className={`font-semibold flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-lg ${
              pathname === "/categories"
                ? "text-on-surface bg-surface-container-high"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            Categorías
          </Link>
          <Link
            href="/trending"
            onClick={() => setIsMenuOpen(false)}
            className={`font-semibold flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-lg ${
              pathname === "/trending"
                ? "text-on-surface bg-surface-container-high"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            Tendencias
          </Link>
        </div>
      )}
    </header>
  );
}
