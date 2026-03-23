"use client";

import { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const categories = [
    {
      id: "tech",
      title: "Desarrollo & Software",
      count: "215",
      color: "from-blue-600 to-cyan-500",
      icon: "code",
      featuredImage: "https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
      featuredCommunity: "React Native Masters",
      featuredDesc: "Domina el desarrollo móvil trans-plataforma."
    },
    {
      id: "design",
      title: "Diseño Visual & UI/UX",
      count: "124",
      color: "from-pink-600 to-rose-400",
      icon: "palette",
      featuredImage: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
      featuredCommunity: "UI Design Hackers",
      featuredDesc: "De conceptualización a Figma tokens avanzados."
    },
    {
      id: "ai",
      title: "Inteligencia Artificial",
      count: "95",
      color: "from-purple-600 to-indigo-500",
      icon: "smart_toy",
      featuredImage: "https://media.giphy.com/media/xUPJPl5gXPo8CtyqQ/giphy.gif",
      featuredCommunity: "Startups Latam Ai",
      featuredDesc: "Automatiza tu agencia con LLMs reales."
    },
    {
      id: "business",
      title: "Negocios & SaaS",
      count: "86",
      color: "from-amber-600 to-yellow-500",
      icon: "storefront",
      featuredImage: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
      featuredCommunity: "SaaS Builders Elite",
      featuredDesc: "Lleva tu ARR a los cielos con nosotros."
    },
    {
      id: "marketing",
      title: "Marketing Digital",
      count: "142",
      color: "from-orange-600 to-red-500",
      icon: "campaign",
      featuredImage: "https://media.giphy.com/media/3o8dp8yN4uU37N8Hj2/giphy.gif",
      featuredCommunity: "Agencias Digitales 360",
      featuredDesc: "Generación de leads B2B predecible."
    },
    {
      id: "web3",
      title: "Cripto & Web3",
      count: "72",
      color: "from-emerald-600 to-teal-400",
      icon: "currency_bitcoin",
      featuredImage: "https://media.giphy.com/media/7FBY7h5Psqd20/giphy.gif",
      featuredCommunity: "DeFi Academy Pro",
      featuredDesc: "Aprende Smart Contracts y finanzas descentralizadas."
    },
    {
       id: "languages",
       title: "Idiomas & Fluidez",
       count: "45",
       color: "from-fuchsia-600 to-pink-500",
       icon: "translate",
       featuredImage: "https://media.giphy.com/media/26tn33aiTi1haPEoE/giphy.gif",
       featuredCommunity: "English Native Path",
       featuredDesc: "Domina el inglés para negocios internacionales."
    },
    {
       id: "health",
       title: "Salud & Bienestar",
       count: "68",
       color: "from-green-600 to-emerald-500",
       icon: "favorite",
       featuredImage: "https://media.giphy.com/media/1wqqlaQ7IX3TXibXZE/giphy.gif",
       featuredCommunity: "Alto Rendimiento Físico",
       featuredDesc: "Optimiza tu biología para rendir 10x."
    },
    {
       id: "art",
       title: "Arte & Expresión",
       count: "34",
       color: "from-indigo-600 to-purple-500",
       icon: "brush",
       featuredImage: "https://media.giphy.com/media/3oEjI6S13RNOBwEuBq/giphy.gif",
       featuredCommunity: "Ilustradores Elite",
       featuredDesc: "De hobby a cobrar por tu arte."
    },
    {
       id: "sales",
       title: "Ventas B2B",
       count: "115",
       color: "from-slate-600 to-zinc-500",
       icon: "handshake",
       featuredImage: "https://media.giphy.com/media/XG8mEYk3G2lA00mIt1/giphy.gif",
       featuredCommunity: "Cerradores High Ticket",
       featuredDesc: "Cómo cobrar +$5k por tus servicios."
    },
    {
       id: "trading",
       title: "Trading & Mercados",
       count: "89",
       color: "from-stone-600 to-neutral-500",
       icon: "monitoring",
       featuredImage: "https://media.giphy.com/media/JtBZm3Getg3dqxEXvX/giphy.gif",
       featuredCommunity: "Acción del Precio Pro",
       featuredDesc: "Operativa institucional real sin indicadores magicos."
    },
    {
       id: "nocode",
       title: "No-Code & Auto",
       count: "210",
       color: "from-sky-600 to-blue-500",
       icon: "bolt",
       featuredImage: "https://media.giphy.com/media/VbO7kE6X3nUaE2U8Jj/giphy.gif",
       featuredCommunity: "Automatizadores",
       featuredDesc: "Software sin escribir una sola línea de código."
    },
    {
       id: "gastronomy",
       title: "Gastronomía",
       count: "28",
       color: "from-red-600 to-orange-500",
       icon: "restaurant",
       featuredImage: "https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif",
       featuredCommunity: "Chefs Digitales",
       featuredDesc: "Cocina de autor para emprendedores."
    },
    {
       id: "music",
       title: "Música & Audio",
       count: "52",
       color: "from-violet-600 to-fuchsia-500",
       icon: "headphones",
       featuredImage: "https://media.giphy.com/media/26n7bT0i7P2Yp6G6s/giphy.gif",
       featuredCommunity: "Productores Musicales",
       featuredDesc: "Estratégia de lanzamiento para artistas."
    }
  ];

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:pl-64 pt-24 pb-20 px-6 max-w-screen-2xl mx-auto min-h-screen bg-surface">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-16 text-center lg:text-left flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-outline-variant/10 pb-8">
            <div>
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                 <span className="material-symbols-outlined text-4xl text-primary">category</span>
                 <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">
                   Explora Categorías
                 </h1>
              </div>
              <p className="text-on-surface-variant max-w-2xl text-lg flex items-center gap-2 justify-center lg:justify-start">
                <span className="material-symbols-outlined text-amber-500">hotel_class</span>
                Sumérgete en nichos hiper-especializados construidos por expertos reales.
              </p>
            </div>
            <div className="hidden lg:flex gap-1 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/10 shadow-inner">
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-2.5 rounded-full transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-surface shadow-md text-primary scale-105' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
                 title="Vista Grid"
               >
                 <span className="material-symbols-outlined text-[20px]">grid_view</span>
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-2.5 rounded-full transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-surface shadow-md text-primary scale-105' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
                 title="Vista Lista"
               >
                 <span className="material-symbols-outlined text-[20px]">view_list</span>
               </button>
            </div>
          </header>

          {viewMode === "grid" ? (
             <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {categories.map((cat) => (
                 <div key={cat.id} className="relative group rounded-[2rem] overflow-hidden bg-surface-container-highest border border-outline-variant/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer h-[320px]">
                    
                    {/* Background Animation Image */}
                    <div className="absolute inset-0 z-0">
                       <img src={cat.featuredImage} alt={cat.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                    </div>
                    
                    {/* Gradient Overlay based on category color */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 mix-blend-multiply z-10 transition-opacity duration-500 group-hover:opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    
                    <div className="relative z-20 h-full flex flex-col p-8">
                       <div className="flex justify-between items-start mb-auto">
                          <span className={`material-symbols-outlined text-4xl text-white bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-lg transform group-hover:-rotate-12 transition-transform duration-300`}>{cat.icon}</span>
                          <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border border-white/10 shadow-lg">
                             {cat.count} Comunidades
                          </span>
                       </div>
                       
                       <div>
                          <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
                            {cat.title}
                          </h2>
                          
                          <div className="mt-4 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                             <p className="text-[10px] font-black uppercase text-white/70 tracking-widest mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                                Destacado en este nicho
                             </p>
                             <div className="bg-black/40 backdrop-blur-lg border border-white/20 p-4 rounded-xl flex flex-col hover:bg-black/60 transition-colors">
                                <span className="text-sm font-bold text-white mb-1 truncate">{cat.featuredCommunity}</span>
                                <span className="text-xs text-white/80 line-clamp-1">{cat.featuredDesc}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
             </section>
          ) : (
             <section className="flex flex-col gap-5">
               {categories.map((cat) => (
                 <div key={cat.id} className="relative group rounded-3xl overflow-hidden bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row items-center p-4 pr-10">
                    
                    <div className="w-full md:w-56 h-36 md:h-28 rounded-2xl overflow-hidden shrink-0 relative mr-0 md:mr-6 mb-4 md:mb-0">
                       <img src={cat.featuredImage} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       <div className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-80 mix-blend-multiply group-hover:opacity-60 transition-opacity`}></div>
                    </div>
                    
                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6 w-full relative z-10">
                       <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform hidden md:flex`}>
                          <span className="material-symbols-outlined text-white text-2xl">{cat.icon}</span>
                       </div>
                       
                       <div className="flex-1">
                          <h2 className="text-2xl font-extrabold text-on-surface mb-2">{cat.title}</h2>
                          <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-4 text-sm font-medium text-on-surface-variant">
                             <div className="flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-[16px] text-primary">local_fire_department</span>
                                {cat.featuredCommunity}
                             </div>
                             <span className="hidden xl:block w-1 h-1 rounded-full bg-outline-variant"></span>
                             <span className="line-clamp-1">{cat.featuredDesc}</span>
                          </div>
                       </div>
                    </div>

                    <div className="shrink-0 mt-6 md:mt-0 flex flex-col items-center justify-center bg-surface-container-high px-6 py-4 rounded-2xl shadow-inner border border-outline-variant/10 self-stretch md:self-auto min-w-[120px]">
                       <span className="text-3xl font-black text-on-surface leading-none mb-1">{cat.count}</span>
                       <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Comunidades</span>
                    </div>

                    {/* Flecha lateral hover */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex group-hover:translate-x-1 duration-300">
                       <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                    </div>
                 </div>
               ))}
             </section>
          )}
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
