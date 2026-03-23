"use client";

import { useState } from "react";

import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";
import { useParams } from "next/navigation";

// Definición local para emular los datos
const mockCommunities = [
  {
    id: 1,
    title: "Diseño UI Avanzado",
    description: "Domina Figma y crea interfaces de clase mundial en 30 días con retos reales.",
    image: "https://picsum.photos/400/250?random=1",
    members: "1.2k",
    category: "Diseño Visual",
    price: "$49/mes",
  },
  {
    id: 2,
    title: "Masterclass de Startups",
    description: "De la primera línea de código a levantar capital. Para fundadores técnicos.",
    image: "https://picsum.photos/400/250?random=2",
    members: "840",
    category: "Emprendimiento",
    price: "$99/mes",
  },
  {
    id: 3,
    title: "Marketing Automático",
    description: "Sistemas predecibles de adquisición utilizando funnels de VSL y cold emails.",
    image: "https://picsum.photos/400/250?random=3",
    members: "2.1k",
    category: "Crecimiento",
    price: "Gratis",
  }
];

export default function CreatorProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const isElite = slug.length % 2 === 0;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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
                        <img src={`https://i.pravatar.cc/150?u=${slug}`} alt="Creator Avatar" className="w-full h-full object-cover" />
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
                     {decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h1>
                  <p className="text-on-surface-variant text-lg md:text-xl font-medium mb-6">
                     Ayudando a miles a escalar operaciones digitales de alto rendimiento. Experto y mentor multiplataforma.
                  </p>
                  <div className="flex gap-6 pb-6 border-b border-outline-variant/10">
                     <div className="flex flex-col">
                        <span className="text-2xl font-black text-on-surface">3</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Comunidades</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-2xl font-black text-on-surface">4.1k</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Miembros Totales</span>
                     </div>
                  </div>
               </div>

               <div className="mb-16">
                  <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">apps</span>
                     Comunidades de este creador
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                     {mockCommunities.map((community) => (
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
                                    src={community.image}
                                 />
                              </div>
                           </div>
                           
                           <div className="p-6 flex flex-col flex-1">
                              <div className="flex justify-between items-start mb-2">
                                 <div className="flex gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                                       {community.category}
                                    </span>
                                 </div>
                              </div>
                              <h3 className="font-extrabold text-lg text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">
                                 {community.title}
                              </h3>
                              <p className="text-on-surface-variant text-xs mb-6 line-clamp-3 leading-relaxed flex-1">
                                 {community.description}
                              </p>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                                 <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[16px]">group</span>
                                    <span className="text-xs font-bold">{community.members}</span>
                                 </div>
                                 {community.price !== 'Gratis' && (
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-amber-950 bg-amber-500 shadow-sm border border-surface-container-lowest`}>
                                       {community.price}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </Link>
                     ))}
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
                     {/* Event 1 */}
                     <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-start text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start w-full mb-4">
                           <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">videocam</span> Virtual (Zoom)
                           </span>
                           <div className="text-right">
                              <span className="block text-2xl font-black text-on-surface leading-none">24</span>
                              <span className="block text-xs font-bold text-on-surface-variant uppercase">Oct</span>
                           </div>
                        </div>
                        
                        <h4 className="font-extrabold text-xl text-on-surface mb-2">Q&A de Ventas B2B</h4>
                        <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 pr-12">Resolución de dudas sobre el último módulo y revisión de Cold Emails en vivo.</p>
                        
                        <div className="flex items-center border-t border-outline-variant/10 pt-4 mt-auto w-full justify-between">
                           <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]">schedule</span> 18:30 (GMT-5)
                           </div>
                           <button className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-container transition-colors">
                              Asistir <span className="material-symbols-outlined text-[12px] align-middle">chevron_right</span>
                           </button>
                        </div>
                     </div>

                     {/* Event 2 */}
                     <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-start text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start w-full mb-4">
                           <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span> Presencial
                           </span>
                           <div className="text-right">
                              <span className="block text-2xl font-black text-on-surface leading-none">15</span>
                              <span className="block text-xs font-bold text-on-surface-variant uppercase">Nov</span>
                           </div>
                        </div>
                        
                        <h4 className="font-extrabold text-xl text-on-surface mb-2">Networking Mastermind</h4>
                        <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 pr-12">Encuentro exclusivo en Madrid para discutir sobre tendencias de producto.</p>
                        
                        <div className="flex items-center border-t border-outline-variant/10 pt-4 mt-auto w-full justify-between">
                           <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]">schedule</span> 20:00 (CET)
                           </div>
                           <button className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-container transition-colors">
                              Reservar Cupo <span className="material-symbols-outlined text-[12px] align-middle">chevron_right</span>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
      <BottomNavBar />
    </>
  );
}
