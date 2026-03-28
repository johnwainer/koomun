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
  const [suggested, setSuggested] = useState<any[]>([]);
  const [authStatus, setAuthStatus] = useState<"pending" | "success" | "unauthorized" | "empty">("pending");

  useEffect(() => {
    async function loadComms() {
       try {
           const { data: { session } } = await supabaseClient.auth.getSession();
          const res = await fetch("/api/private/my-communities", { cache: 'no-store', 
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
                 const sgRes = await fetch("/api/communities");
                 if (sgRes.ok) {
                    const sgData = await sgRes.json();
                    if (sgData.communities) {
                       const shuffled = [...sgData.communities].sort(() => 0.5 - Math.random());
                       const mapped = shuffled.slice(0, 3).map((c: any) => ({
                          id: c.id,
                          slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                          title: c.title,
                          description: c.description || "",
                          category: c.category?.name || "Varia",
                          members: c.members?.[0]?.count ? c.members[0].count.toString() : "0", 
                          price: c.price_tier,
                          image: c.cover_image_url || `https://picsum.photos/seed/${c.id}/400/250`,
                          creatorAvatar: c.creator?.avatar_url,
                          creatorFullName: c.creator?.full_name,
                          creatorUsername: c.creator?.username || `Creador-${c.id}`,
                          isElite: c.creator?.plan === 'elite'
                       }));
                       setSuggested(mapped);
                    }
                 }
              }
           }
       } catch (e) {
           
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
               <div className="w-full">
                  <AccessMessage type="empty" title="Aún no tienes comunidades" description="Explora algunas de nuestras comunidades sugeridas." icon="group_off" />
                  
                  {suggested.length > 0 && (
                     <div className="mt-12">
                        <h2 className="text-2xl font-black text-on-surface mb-6">Sugerencias para ti</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {suggested.map(community => (
                             <div
                               onClick={() => router.push(`/c/${community.slug}`)}
                               key={community.id}
                               className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full cursor-pointer"
                             >
                                <div className="relative">
                                  <div className="h-40 bg-surface-container-high overflow-hidden relative">
                                    <img
                                      alt={community.title}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      src={community.image}
                                      onError={(e) => { e.currentTarget.src = "https://picsum.photos/400/250?blur=2"; }}
                                    />
                                  </div>
                                  
                                  <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
                                    <div 
                                        className="relative cursor-pointer hover:scale-105 transition-transform"
                                        onClick={(e) => {
                                           e.stopPropagation();
                                           router.push(`/creator/${community.creatorUsername}`);
                                        }}
                                    >
                                       <div className={`w-12 h-12 flex items-center justify-center font-black text-xl text-white rounded-full border-[3px] bg-primary overflow-hidden shadow-sm ${community.isElite ? 'border-zinc-900' : 'border-surface-container-lowest'}`}>
                                         {community.creatorAvatar ? (
                                             <img src={community.creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                                         ) : (
                                             (community.creatorFullName?.charAt(0) || community.creatorUsername?.charAt(0) || "C").toUpperCase()
                                         )}
                                       </div>
                                       {community.isElite && (
                                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-[1px] rounded-full shadow border-2 border-surface-container-lowest whitespace-nowrap z-20 md:text-[7px] md:px-2 md:py-0.5">
                                             Elite
                                          </div>
                                       )}
                                    </div>
                                  </div>
                                </div>

                                <div className="p-6 pt-8 flex flex-col flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                     <div className="flex gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                                            [
                                              "text-blue-700 bg-blue-50 border-blue-200",
                                              "text-emerald-700 bg-emerald-50 border-emerald-200",
                                              "text-amber-700 bg-amber-50 border-amber-200",
                                              "text-purple-700 bg-purple-50 border-purple-200",
                                              "text-rose-700 bg-rose-50 border-rose-200"
                                            ][(community.category || 'C').length % 5]
                                        }`}>
                                          {community.category}
                                        </span>
                                     </div>
                                  </div>
                                  <h3 className="font-extrabold text-lg text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">
                                     {community.title}
                                  </h3>
                                  <p className="text-on-surface-variant text-xs mb-6 line-clamp-2 leading-relaxed flex-1">
                                    {community.description}
                                  </p>

                                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                                    <div className="flex items-center gap-2 text-on-surface-variant">
                                      <span className="material-symbols-outlined text-[16px]">
                                        group
                                      </span>
                                      <span className="text-xs font-bold">
                                         {community.members}
                                      </span>
                                    </div>
                                    {community.price && community.price !== 'Gratis' && (
                                       <span className={`text-xs font-black px-2 py-0.5 rounded text-on-surface bg-surface-container-highest`}>
                                         {community.price}
                                       </span>
                                    )}
                                  </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
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
                          router.push(`/creator/${community.creatorUsername}`);
                       }}
                       className="relative cursor-pointer hover:scale-105 transition-transform"
                    >
                       <div className={`w-16 h-16 flex items-center justify-center font-black text-2xl text-white rounded-full border-[4px] bg-primary overflow-hidden shadow-md ${community.isElite ? 'border-zinc-900' : 'border-surface-container-lowest'}`}>
                         {community.creatorAvatar ? (
                             <img src={community.creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                         ) : (
                             (community.creatorFullName?.charAt(0) || community.creatorUsername?.charAt(0) || "C").toUpperCase()
                         )}
                       </div>
                       {community.isElite && (
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
