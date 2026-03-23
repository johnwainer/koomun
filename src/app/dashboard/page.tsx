"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import AccessMessage from "@/components/AccessMessage";
import { supabaseClient } from "@/lib/supabase";

import { useEffect, useState } from "react";

export default function MyCommunitiesPage() {
  const router = useRouter();
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [authStatus, setAuthStatus] = useState<"pending" | "success" | "unauthorized" | "empty">("pending");

  useEffect(() => {
    async function loadComms() {
       try {
           const { data: { session } } = await supabaseClient.auth.getSession();
          const res = await fetch("/api/private/my-communities", {
             headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
          });
           if (res.status === 401) {
              setAuthStatus("unauthorized");
              return;
           }
           if (res.ok) {
              const data = await res.json();
              if (data.communities && data.communities.length > 0) {
                 setMyCommunities(data.communities);
                 setAuthStatus("success");
              } else {
                 setAuthStatus("empty");
              }
           }
       } catch (e) {
           console.error(e);
           setAuthStatus("empty");
       }
    }
    loadComms();
  }, []);

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-6 min-h-screen bg-surface">
        <div className="w-full max-w-7xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Mis Comunidades
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">Todas las comunidades privadas a las que perteneces.</p>
            </div>
            
            <Link href="/">
              <button className="px-6 py-3 border-2 border-outline-variant/30 text-on-surface font-extrabold rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-sm flex items-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">explore</span>
                 Descubrir Más
              </button>
            </Link>
          </header>

          <div className={`gap-8 ${authStatus === "success" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex"}`}>
            {authStatus === "pending" ? (
               <div className="w-full min-h-[300px] flex items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
               </div>
            ) : authStatus === "unauthorized" ? (
               <AccessMessage type="unauthorized" title="Debes iniciar sesión" description="Debes iniciar sesión para ver tus comunidades inscritas." icon="lock" />
            ) : authStatus === "empty" ? (
               <AccessMessage type="empty" title="Aún no tienes comunidades" description="Aún no eres miembro de ninguna comunidad." icon="group_off" />
            ) : (
            myCommunities.map((community) => (
              <div
                onClick={() => router.push(`/c/${community.id}`)}
                key={community.id}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col cursor-pointer"
              >
                <div className="relative">
                  <div className="h-40 bg-surface-container-highest overflow-hidden relative">
                    <img
                      alt={community.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      src={community.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(community.name)}&size=300`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-10">
                     {community.price_tier === 'Pago' && (
                       <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 border-amber-500 text-amber-500 bg-amber-500/10 shadow-sm backdrop-blur-md">
                          Comunidad Paga
                       </span>
                     )}
                  </div>

                  <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
                    <div 
                       onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/creator/Creador-${community.id}`);
                       }}
                       className="relative cursor-pointer hover:scale-105 transition-transform"
                    >
                       <div className={`w-16 h-16 rounded-full border-[4px] bg-surface-container overflow-hidden shadow-md ${community.price_tier === 'Pago' ? 'border-zinc-900' : 'border-surface-container-lowest'}`}>
                         <img src={`https://i.pravatar.cc/150?u=${community.id}`} alt="Creator" className="w-full h-full object-cover" />
                       </div>
                       {community.price_tier === 'Pago' && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[7px] font-black uppercase tracking-widest px-2 py-[1px] rounded-full shadow border-2 border-surface-container-lowest whitespace-nowrap z-20">
                             Elite
                          </div>
                       )}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pt-10 flex flex-col flex-1">
                  <h3 className="font-extrabold text-xl text-on-surface mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-2 mt-2">
                    {community.name}
                  </h3>
                  
                  <div className="mt-auto">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-on-surface-variant">Progreso de Aulas</span>
                        <span className="text-xs font-black text-on-surface">0%</span>
                     </div>
                     <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 bg-primary`}
                           style={{ width: `0%` }}
                        ></div>
                     </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
