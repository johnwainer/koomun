"use client";

import { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";

export default function CreatorsPage() {
  const [filter, setFilter] = useState("Destacados");
  const [visibleCount, setVisibleCount] = useState(8);

  const filters = ["Destacados", "Mejor Valorados", "A-Z", "Nuevos", "Antiguos"];

  const creatorsBase = [
    { id: 1, name: "David Santos", bio: "Hacker de Growth y adquisición B2B nativa.", followers: "12.4k", communities: 3, isElite: true, image: "https://i.pravatar.cc/150?u=creator1" },
    { id: 2, name: "Laura Méndez", bio: "Estratega de contenidos y lanzamientos.", followers: "8.1k", communities: 1, isElite: false, image: "https://i.pravatar.cc/150?u=creator2" },
    { id: 3, name: "Fernando Ruiz", bio: "Maestro en funnels invisibles de alta conversión.", followers: "14k", communities: 2, isElite: true, image: "https://i.pravatar.cc/150?u=creator3" },
    { id: 4, name: "Andrea Velez", bio: "Directora de agencias creativas y copywriter.", followers: "5.5k", communities: 1, isElite: false, image: "https://i.pravatar.cc/150?u=creator4" },
    { id: 5, name: "Carlos Ortega", bio: "Desarrollador Full Stack & Startups AI.", followers: "2.8k", communities: 4, isElite: true, image: "https://i.pravatar.cc/150?u=creator5" },
    { id: 6, name: "Sofía Navarro", bio: "Diseñadora de Interfaces, Figma Master.", followers: "18k", communities: 2, isElite: true, image: "https://i.pravatar.cc/150?u=creator6" },
    { id: 7, name: "Roberto Gómez", bio: "Especialista en Automatizaciones y flujos No-Code.", followers: "9.2k", communities: 3, isElite: false, image: "https://i.pravatar.cc/150?u=creator7" },
    { id: 8, name: "Daniela Vargas", bio: "Mentora de Emprendedoras, Finanzas Personales.", followers: "25k", communities: 5, isElite: true, image: "https://i.pravatar.cc/150?u=creator8" },
    { id: 9, name: "Luis Montero", bio: "Consultor de ventas high-ticket y neuroventas.", followers: "11k", communities: 2, isElite: true, image: "https://i.pravatar.cc/150?u=creator9" },
    { id: 10, name: "Camila Ríos", bio: "Experta en Marketing de Influencers y TikTok.", followers: "33k", communities: 1, isElite: false, image: "https://i.pravatar.cc/150?u=creator10" },
    { id: 11, name: "Esteban Paz", bio: "Cripto, Trading Algorítmico y DeFi.", followers: "42k", communities: 6, isElite: true, image: "https://i.pravatar.cc/150?u=creator11" },
    { id: 12, name: "Valeria Soto", bio: "Nutrición deportiva y coaching holístico.", followers: "7.4k", communities: 2, isElite: false, image: "https://i.pravatar.cc/150?u=creator12" },
  ];

  const creators = [
     ...creatorsBase,
     ...creatorsBase.map(c => ({ ...c, id: c.id + 12, image: `https://i.pravatar.cc/150?u=creator${c.id+12}` }))
  ];

  const visibleCreators = creators.slice(0, visibleCount);
  const hasMore = visibleCount < creators.length;

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      
      <main className="lg:pl-64 pt-24 pb-20 px-6 max-w-screen-2xl mx-auto min-h-screen bg-surface">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div>
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
                 Creadores Top
               </h1>
               <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                 Explora nuestro directorio global de creadores y expertos. Conéctate con los líderes que están redefiniendo sus industrias en tiempo real.
               </p>
            </div>
            <div className="shrink-0 flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0">
               <div className="flex justify-center md:justify-end">
                  <Link href="/leaderboard" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                     <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                     Ranking
                  </Link>
               </div>
               <div className="flex flex-wrap justify-center md:justify-end gap-2">
                 {filters.map((f) => (
                   <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                    filter === f 
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl scale-105' 
                      : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/60'
                  }`}
                  >
                     {f}
                  </button>
                 ))}
               </div>
            </div>
          </header>


          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
             {visibleCreators.map((creator) => (
                <div key={creator.id} className="bg-surface-container-lowest border border-outline-variant/15 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 flex flex-col items-center text-center relative cursor-pointer overflow-hidden">
                   
                   {/* Background Decorator */}
                   <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none group-hover:from-primary/10 transition-colors"></div>

                   <div className="relative mb-6 z-10 w-24 h-24 mt-2">
                      <div className={`w-24 h-24 rounded-full overflow-hidden shadow-xl border-[4px] ${creator.isElite ? 'border-zinc-900' : 'border-surface'} transition-all`}>
                         <img src={creator.image} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      {creator.isElite && (
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-surface-container-lowest whitespace-nowrap truncate">
                            Elite
                         </div>
                      )}
                   </div>

                   <h3 className="text-xl font-extrabold text-on-surface mb-2">{creator.name}</h3>
                   <p className="text-sm font-medium text-on-surface-variant line-clamp-2 mb-6 flex-1">{creator.bio}</p>

                   <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/10 text-on-surface">
                      <div className="flex flex-col gap-1 items-center">
                         <span className="text-2xl font-black text-primary">{creator.communities}</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Comunidades</span>
                      </div>
                      <div className="flex flex-col gap-1 items-center border-l border-outline-variant/10">
                         <span className="text-xl font-black text-on-surface">{creator.followers}</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Miembros Totales</span>
                      </div>
                   </div>

                   {/* Hover Action */}
                   <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20">
                      <Link href={`/creator/${creator.name.toLowerCase().replace(/ /g, '-')}`}>
                         <button className="px-8 py-3 bg-white text-zinc-900 font-black rounded-full shadow-2xl hover:scale-105 transition-transform">
                            Visitar Perfil
                         </button>
                      </Link>
                   </div>
                </div>
             ))}
          </section>

          {hasMore && (
             <div className="flex justify-center mt-12 mb-8">
               <button 
                onClick={() => setVisibleCount(p => p + 8)}
                className="px-8 py-3 font-bold text-sm bg-surface-container-low text-on-surface hover:bg-surface-container-highest transition-colors rounded-full border border-outline-variant/20 shadow-sm flex items-center gap-2 active:scale-95"
               >
                 <span>Cargar Más Creadores</span>
                 <span className="material-symbols-outlined text-[18px]">expand_more</span>
               </button>
             </div>
          )}
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
