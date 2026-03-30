"use client";

import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";

export default function TrendingPage() {
  const router = useRouter();
  const [trendingCommunities, setTrendingCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      // Fetch published communities ordered by creation or random for now
      // In a real app we would order by members count or growth metric
      const { data, error } = await supabaseClient
         .from('communities')
         .select('id, title, description, cover_image_url, created_at, creator:profiles(full_name, avatar_url, plan), members(count)')
         .eq('is_published', true)
         .order('created_at', { ascending: false })
         .limit(15);
         
      if (data) {
         const mapped = data.map((c: any, index: number) => ({
             rank: index + 1,
             name: c.title,
             id: c.id,
             desc: c.description ? c.description.split("||--FEATURES--||")[0] : 'Sin descripción',
             growth: "+0%", // proxy
             members: c.members[0]?.count || "0",
             trendColor: index < 2 ? "text-amber-500" : "text-green-500",
             bgTrend: index < 2 ? "bg-amber-500/10" : "bg-green-500/10",
             icon: "rocket_launch",
             image: c.cover_image_url || "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
             creator: c.creator?.avatar_url || "https://i.pravatar.cc/150",
             is_elite: c.creator?.plan === 'elite'
         }));
         setTrendingCommunities(mapped);
      }
      setLoading(false);
    }
    loadTrending();
  }, []);
// Static data removed

  const top3 = trendingCommunities.slice(0, 3);
  const rest = trendingCommunities.slice(3);

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      
      <main className="lg:pl-64 pt-24 pb-20 px-6 max-w-screen-2xl mx-auto min-h-screen bg-surface">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <header className="mb-16 text-center lg:text-left flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
                  <span className="material-symbols-outlined text-4xl text-primary animate-bounce">local_fire_department</span>
                  <span className="text-sm font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full shadow-sm">Hot esta semana</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
                 Tendencias Globales
               </h1>
               <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed mix-blend-multiply">
                 Descubre las comunidades con el crecimiento más explosivo en las últimas 48 horas. Únete antes de que cierren accesos o suban precios.
               </p>
            </div>
          </header>

          {/* Top 3 Podium Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
             {top3.map((community, i) => (
                <div 
                  key={community.rank} 
                  onClick={() => router.push(`/c/${community.id}`)}
                  className={`bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-2xl relative group cursor-pointer border hover:-translate-y-2 transition-transform duration-300 ${i === 0 ? 'border-amber-500/30 md:scale-105 z-10' : 'border-outline-variant/20'}`}
                >
                   {/* Rank Badge */}
                   <div className="absolute top-4 left-4 z-20">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shadow-lg ${i === 0 ? 'bg-amber-500 text-amber-950 scale-110' : 'bg-surface-container-lowest text-on-surface'}`}>
                         #{community.rank}
                      </div>
                   </div>

                   <div className="relative">
                       <div className="h-48 md:h-64 relative bg-surface-container-high overflow-hidden">
                          <img src={community.image!} alt={community.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                       </div>
                       
                       {/* Creator Avatar - Out of overflow block */}
                       <div className="absolute bottom-0 left-6 translate-y-1/2 z-20">
                          <div 
                             onClick={(e) => { e.stopPropagation(); router.push(`/creator/Creador-${community.rank}`); }}
                             className={`relative w-16 h-16 rounded-full border-[4px] bg-surface-container overflow-hidden shadow-xl cursor-pointer hover:scale-105 transition-transform ${community.rank % 2 === 0 ? 'border-zinc-900' : 'border-surface-container-lowest'}`}
                          >
                             <img src={community.creator} alt="Creator" className="w-full h-full object-cover" />
                          </div>
                           {community.is_elite && (
                             <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[6px] md:text-[7px] font-black uppercase tracking-widest px-1.5 py-[1px] rounded-full shadow border-2 border-surface-container-lowest whitespace-nowrap z-20">
                                Elite
                             </div>
                           )}
                       </div>
                   </div>

                   <div className="p-8 pt-10 flex flex-col relative z-20">
                      <h2 className={`text-2xl font-extrabold mb-3 leading-tight ${i === 0 ? 'text-amber-500' : 'text-on-surface'}`}>{community.name}</h2>
                      <p className="text-sm font-medium text-on-surface-variant mb-8 line-clamp-2">{community.desc}</p>
                      
                      <div className="flex items-center justify-between mt-auto border-t border-outline-variant/10 pt-6">
                         <div className="flex items-center gap-2 text-on-surface">
                            <span className="material-symbols-outlined text-[18px] text-outline-variant">group</span>
                            <span className="font-bold">{community.members}</span>
                         </div>
                         <div className={`px-4 py-1.5 rounded-full flex items-center gap-1 ${community.bgTrend} ${community.trendColor}`}>
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span className="text-sm font-black">{community.growth}</span>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </section>

          {/* Rest of the list */}
          <section className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl overflow-hidden shadow-lg p-2">
             <div className="hidden md:grid grid-cols-12 px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low/50 rounded-2xl mb-2">
               <div className="col-span-1">Rank</div>
               <div className="col-span-5">Comunidad</div>
               <div className="col-span-4 text-center">Acerca de</div>
               <div className="col-span-2 text-right">Velocidad</div>
             </div>

             {rest.map((community) => (
               <div key={community.rank} className="grid grid-cols-1 md:grid-cols-12 px-6 py-5 items-center hover:bg-surface-container-high/40 rounded-2xl cursor-pointer group transition-colors border-b md:border-b-0 border-outline-variant/10 last:border-0">
                 <div className="col-span-1 text-3xl font-black text-outline-variant/30 group-hover:text-on-surface transition-colors hidden md:block">
                   #{community.rank}
                 </div>
                 
                 <div className="col-span-5 flex items-center gap-5 mb-4 md:mb-0">
                   {/* Mobile Rank */}
                   <div className="md:hidden text-2xl font-black text-on-surface min-w-[30px]">
                     #{community.rank}
                   </div>
                   <div 
                      onClick={(e) => { e.stopPropagation(); router.push(`/creator/Creador-${community.rank}`); }}
                      className="relative shrink-0 transition-transform cursor-pointer hover:scale-105"
                   >
                      <div className={`w-14 h-14 rounded-full overflow-hidden bg-surface-container border shadow-sm ${community.rank % 2 === 0 ? 'border-[3px] border-zinc-900' : 'border border-outline-variant/20'}`}>
                         <img src={community.creator} alt="Creator" className="w-full h-full object-cover" />
                      </div>
                       {community.is_elite && (
                         <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-[1px] rounded-full shadow border-2 border-surface-container-lowest whitespace-nowrap z-20 md:text-[7px] md:px-2 md:py-[1px]">
                            Elite
                         </div>
                       )}
                   </div>
                   <div>
                      <h3 className="font-extrabold text-lg text-on-surface group-hover:text-primary transition-colors leading-tight mb-1">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">group</span> {community.members} miembros
                      </div>
                   </div>
                 </div>
                 
                 <div className="col-span-4 hidden md:block px-4">
                    <p className="text-sm text-on-surface-variant font-medium line-clamp-1 group-hover:text-on-surface transition-colors text-center">{community.desc}</p>
                 </div>
                 
                 <div className="col-span-2 flex items-center md:justify-end gap-6 justify-between">
                   <div className={`px-4 py-2 ${community.bgTrend} rounded-xl flex items-center justify-center gap-2 ${community.trendColor} min-w-[100px] shadow-inner`}>
                     <span className="material-symbols-outlined text-[16px]">stacked_line_chart</span>
                     <span className="text-sm font-black tracking-wide">{community.growth}</span>
                   </div>
                 </div>
               </div>
             ))}
          </section>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
