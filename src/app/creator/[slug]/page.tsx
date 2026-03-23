"use client";

import { useState, useEffect } from "react";

import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CreatorProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [creator, setCreator] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/public/creators/${slug}`);
        if (!res.ok) {
           router.replace('/creators');
           return;
        }
        const data = await res.json();
        setCreator(data.creator);
        setCommunities(data.communities || []);
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, router]);

  const isElite = creator?.plan === 'elite';

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center animate-pulse"><span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span></div>;
  if (!creator) return null;

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      
      <main className="lg:pl-64 pt-16 pb-20 bg-surface min-h-screen">
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Portada Superior del Creador */}
            <div className="w-full h-48 md:h-72 relative bg-surface-container-high border-b border-outline-variant/10">
               <img src={`https://picsum.photos/1920/400?blur=1`} alt="Banner del Creador" className="w-full h-full object-cover opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               {isElite && (
                  <div className="absolute top-4 right-4 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-surface-container-highest">
                     Creador Elite
                  </div>
               )}
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
               
               {/* Head Visual con la foto y botones */}
               <div className="flex flex-col md:flex-row justify-between md:items-end -mt-12 md:-mt-16 mb-8 gap-4">
                  <div className="relative z-10 shrink-0 self-start">
                     <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full border-[6px] bg-surface-container-highest shadow-xl overflow-hidden ${isElite ? 'border-zinc-900' : 'border-surface'}`}>
                        <img src={creator?.avatar_url || `https://i.pravatar.cc/150?u=${creator.id}`} alt="Creator Avatar" className="w-full h-full object-cover" />
                     </div>
                     {isElite && (
                        <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-surface-container-lowest">
                           Elite
                        </div>
                     )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 pb-2 w-full md:w-auto">
                     <button 
                        onClick={() => setIsSubscribed(!isSubscribed)}
                        className={`flex-1 md:flex-none uppercase tracking-widest px-8 py-3 font-extrabold rounded-full shadow-lg text-sm transition-all focus:scale-95 flex items-center justify-center gap-2 ${
                           isSubscribed 
                             ? 'bg-surface-container-high text-on-surface hover:bg-surface-container' 
                             : 'bg-primary text-white hover:bg-primary-container'
                        }`}
                     >
                        {isSubscribed ? (
                           <>
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              Suscrito
                           </>
                        ) : 'Suscribirse al Creador'}
                     </button>
                     <button 
                        onClick={handleShare}
                        className={`flex-1 md:flex-none px-4 py-3 font-extrabold text-sm rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm border ${
                           isCopied 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                              : 'bg-surface-container-highest hover:bg-outline-variant/20 text-on-surface border-outline-variant/10'
                        }`}
                     >
                        <span className="material-symbols-outlined text-[20px]">
                           {isCopied ? 'check' : 'share'}
                        </span> 
                        {isCopied ? 'Enlace Copiado' : 'Compartir'}
                     </button>
                  </div>
               </div>

               <div className="mb-12">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-2">
                     {creator.full_name}
                  </h1>
                  <p className="text-on-surface-variant text-lg md:text-xl font-medium mb-6">
                     {creator.bio || "Creador Elite. Especialista experto y mentor multiplataforma."}
                  </p>
                  <div className="flex gap-6 pb-6 border-b border-outline-variant/10">
                     <div className="flex flex-col">
                        <span className="text-2xl font-black text-on-surface">{communities.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Comunidades</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-2xl font-black text-on-surface">{(communities.length * 80) + 1}k</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Influencia Global</span>
                     </div>
                  </div>
               </div>

               <div className="mb-16">
                  <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">apps</span>
                     Comunidades de este creador
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                     {communities.length === 0 ? (
                        <p className="text-on-surface-variant italic">No ha publicado comunidades todavía.</p>
                     ) : (
                        communities.map((community: any) => (
                           <Link
                              href={`/c/${community.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              key={community.id}
                              className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full cursor-pointer"
                           >
                              <div className="relative">
                                 <div className="h-40 bg-surface-container-high overflow-hidden relative">
                                    <img
                                       alt={community.title}
                                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                       src={community.cover_image_url || `https://picsum.photos/seed/${community.id}/400/250`}
                                    />
                                 </div>
                              </div>
                              
                              <div className="p-6 flex flex-col flex-1">
                                 <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                                          [
                                            "text-blue-700 bg-blue-50 border-blue-200",
                                            "text-emerald-700 bg-emerald-50 border-emerald-200",
                                            "text-amber-700 bg-amber-50 border-amber-200",
                                            "text-purple-700 bg-purple-50 border-purple-200",
                                            "text-rose-700 bg-rose-50 border-rose-200"
                                          ][(community.category?.name || 'Comunidad').length % 5]
                                       }`}>
                                          {community.category?.name || 'Comunidad'}
                                       </span>
                                    </div>
                                 </div>
                                 <h3 className="font-extrabold text-lg text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">
                                    {community.title}
                                 </h3>
                                 <p className="text-on-surface-variant text-xs mb-6 line-clamp-3 leading-relaxed flex-1">
                                    {community.description || 'Explora este ecosistema privado único.'}
                                 </p>
                                 
                                 <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                                    <div className="flex items-center gap-2 text-on-surface-variant">
                                       <span className="material-symbols-outlined text-[16px]">group</span>
                                       <span className="text-xs font-bold">{community.members?.[0]?.count ? community.members[0].count : '0'}</span>
                                    </div>
                                    {community.price_tier?.toLowerCase() !== 'gratis' && (
                                       <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-amber-950 bg-amber-500 shadow-sm border border-surface-container-lowest`}>
                                          {community.price_tier}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </Link>
                        ))
                     )}
                  </div>
               </div>
               
               {/* Eventos y Masterclasses Section */}
               <div className="mt-24 mb-12">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                     <div>
                        <div className="flex items-center gap-2 mb-2 text-primary">
                           <span className="material-symbols-outlined text-sm font-bold">event</span>
                           <h2 className="text-xs font-black uppercase tracking-widest">Calendario</h2>
                        </div>
                        <h3 className="text-3xl font-extrabold text-on-surface">Eventos & Masterclasses</h3>
                        <p className="text-on-surface-variant max-w-xl mt-2 text-sm">
                           No te pierdas mis próximos Q&A, talleres en vivo y encuentros presenciales exclusivos para mis suscriptores.
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {events.length === 0 ? (
                        <p className="text-on-surface-variant italic">Este creador no tiene eventos agendados.</p>
                     ) : (
                        events.map((e: any, idx) => {
                           const isPresencial = e.type === "Presencial";
                           const pcolor = isPresencial ? "orange" : "blue";
                           return (
                             <div key={idx} className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-start text-left relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${pcolor}-500/5 rounded-full blur-3xl group-hover:bg-${pcolor}-500/10 transition-colors pointer-events-none`}></div>
                                
                                <div className="flex justify-between items-start w-full mb-4">
                                   <span className={`bg-${pcolor}-500/10 text-${pcolor}-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1`}>
                                      <span className="material-symbols-outlined text-[14px]">
                                         {isPresencial ? 'location_on' : 'videocam'}
                                      </span> 
                                      {e.type}
                                   </span>
                                   <div className="text-right">
                                      <span className="block text-xl font-black text-on-surface leading-none">{e.event_date}</span>
                                   </div>
                                </div>
                                
                                <h4 className="font-extrabold text-xl text-on-surface mb-2 truncate max-w-[90%]">{e.title}</h4>
                                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 pr-12">{e.description || "Evento exclusivo."}</p>
                                
                                <div className="flex items-center border-t border-outline-variant/10 pt-4 mt-auto w-full justify-between">
                                   <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                                      <span className="material-symbols-outlined text-[18px]">schedule</span> {e.event_time}
                                   </div>
                                   <button className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-container transition-colors">
                                      Reservar Cupo <span className="material-symbols-outlined text-[12px] align-middle">chevron_right</span>
                                   </button>
                                </div>
                             </div>
                           );
                        })
                     )}
                  </div>
               </div>
            </div>
         </div>
      </main>
      <BottomNavBar />
    </>
  );
}
