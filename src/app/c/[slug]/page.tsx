"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

export default function CommunityLandingPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Let's create a beautiful dynamic mock data object based on the requested community slug
  const formatSlugName = (s: string) => {
    return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const communityName = slug ? formatSlugName(slug) : "Ecosistema Koomun";
  
  // Deterministic Mock: if the slug has an even number of characters, it's premium. If odd, it's free.
  // This guarantees a mix of free and paid communities when browsing from the Home page.
  const isPaid = slug.length % 2 === 0;
  const price = isPaid ? "$29/mes" : "Gratis";
  
  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-16 bg-surface min-h-screen">
        
        {/* Banner Area (Pure Image, no text overlay) */}
        <div className="w-full h-32 md:h-64 bg-surface-container-highest relative overflow-hidden">
           {/* Cover Image */}
           <img 
              src={isPaid ? "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" : "https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif"} 
              alt="Community Cover" 
              className="w-full h-full object-cover" 
           />
           {/* Subtle gradient at top to frame potential TopNav overlays if transparent */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-1/2"></div>
        </div>

        {/* Content Below Banner */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
           
           {/* Avatar & Badges Header */}
           <div className="flex justify-between items-end -mt-12 md:-mt-16 mb-4">
              <div className="relative z-10 shrink-0">
                 <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-[4px] md:border-[6px] bg-surface-container-highest shadow-xl overflow-hidden ${isPaid ? 'border-zinc-900' : 'border-surface'}`}>
                    <img src={`https://i.pravatar.cc/150?u=${slug}`} alt="Creator Avatar" className="w-full h-full object-cover" />
                 </div>
                 {isPaid && (
                    <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg border-2 border-surface-container-lowest whitespace-nowrap z-20">
                       Elite
                    </div>
                 )}
              </div>
              
              <div className="hidden md:block pb-2">
                  {isPaid && (
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 border-amber-500 text-amber-500 bg-amber-500/5`}>
                       Comunidad Paga
                    </span>
                  )}
              </div>
           </div>

           {/* Title & Info */}
           <div className="mb-12">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                 <span className="text-xs font-black tracking-widest uppercase bg-surface-container-high text-on-surface px-2 py-1 rounded">Desarrollo & Tech</span>
                 <span className="text-xs font-black tracking-widest uppercase flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">group</span> 12.4k miembros
                 </span>
                 {isPaid && (
                    <span className="md:hidden px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-amber-500 text-amber-500">
                       Paga
                    </span>
                 )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter leading-tight mb-4">
                 {communityName}
              </h1>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-3xl">
                 Únete a una comunidad enfocada en el progreso constante, liderada por expertos de la industria. Rompe límites, conéctate con profesionales y construye el siguiente nivel de tu carrera tecnológica con nosotros.
              </p>
           </div>

           {/* Two columns layout: Details & CTA Box */}
           <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 pb-28 md:pb-16">
              
              {/* Left Column: Details */}
              <div className="flex flex-col gap-10">
                 <section>
                    <h2 className="text-2xl font-bold text-on-surface mb-6">Acerca de este Ecosistema</h2>
                    <p className="text-on-surface-variant leading-relaxed text-base mb-4">
                       Bienvenido a {communityName}. Aquí no solo aprenderás teoría, sino que aplicarás en tiempo real las mismas estrategias que utilizamos en nuestras propias operaciones para generar resultados de alto impacto. 
                    </p>
                    <p className="text-on-surface-variant leading-relaxed text-base">
                       Nuestra misión es recortar tu curva de aprendizaje a una fracción del tiempo mediante contenido curado sin rodeos, plantillas operativas listas para clocar y un entorno de personas que comparten tu misma hambre.
                    </p>
                 </section>

                 <section className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8 rounded-3xl shadow-sm">
                    <h3 className="text-xl font-bold text-on-surface mb-6">¿Qué vas a obtener exactamente?</h3>
                    
                    <div className="flex flex-col gap-6">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined text-2xl">forum</span>
                          </div>
                          <div>
                             <h4 className="font-bold text-on-surface">Chat Privado y Networking</h4>
                             <p className="text-sm text-on-surface-variant mt-1">Conecta 24/7 con otros miembros activos. Resuelve tus dudas en tiempo récord.</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined text-2xl">play_lesson</span>
                          </div>
                          <div>
                             <h4 className="font-bold text-on-surface">Librería de Contenidos Masterclass</h4>
                             <p className="text-sm text-on-surface-variant mt-1">Más de 20 módulos en formato video y guías interactivas desbloqueadas de por vida.</p>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined text-2xl">groups</span>
                          </div>
                          <div>
                             <h4 className="font-bold text-on-surface">Live Calls Semanales</h4>
                             <p className="text-sm text-on-surface-variant mt-1">Mentorías en vivo para revisar tus avances y consultar dudas técnicas cara a cara.</p>
                          </div>
                       </div>
                    </div>
                 </section>
                 {/* Eventos Section de esta Comunidad */}
                 <section className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8 rounded-3xl shadow-sm mt-4">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                       <span className="material-symbols-outlined text-3xl">event_available</span>
                       <h3 className="text-2xl font-bold text-on-surface">Próximos Eventos</h3>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                       <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-surface-container-high/30 border border-outline-variant/10 hover:border-primary/30 transition-colors group">
                          <div className="shrink-0 w-16 h-16 rounded-xl bg-surface-container-highest flex flex-col items-center justify-center text-center shadow-inner">
                             <span className="text-xl font-black text-on-surface leading-none">12</span>
                             <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">OCT</span>
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">videocam</span> Virtual</span>
                             </div>
                             <h4 className="font-bold text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">Sesión de Análisis de Casos</h4>
                             <p className="text-sm text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">schedule</span> 19:00 - 20:30 (GMT-5)
                             </p>
                          </div>
                          <div className="shrink-0 flex items-center md:items-start pt-2 md:pt-0">
                             <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full whitespace-nowrap">Exclusivo Miembros</span>
                          </div>
                       </div>

                       <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-surface-container-high/30 border border-outline-variant/10 hover:border-orange-500/30 transition-colors group">
                          <div className="shrink-0 w-16 h-16 rounded-xl bg-surface-container-highest flex flex-col items-center justify-center text-center shadow-inner">
                             <span className="text-xl font-black text-on-surface leading-none">05</span>
                             <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">NOV</span>
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">location_on</span> Presencial</span>
                             </div>
                             <h4 className="font-bold text-lg text-on-surface mb-1 group-hover:text-orange-500 transition-colors">Mastermind Local City Hub</h4>
                             <p className="text-sm text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">location_on</span> Innovación Principal
                             </p>
                          </div>
                          <div className="shrink-0 flex items-center md:items-start pt-2 md:pt-0">
                              <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full whitespace-nowrap">Comunidad Paga</span>
                          </div>
                       </div>
                    </div>
                 </section>
              </div>

              {/* Right Column: Sticky Pricing Card */}
              <div className="relative">
                 <div className="sticky top-24 bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                    
                    <div className="text-center pb-6 border-b border-outline-variant/10">
                       <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-2">Acceso Oficial</h3>
                       <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-5xl font-black tracking-tight ${isPaid ? 'text-amber-500' : 'text-green-500'}`}>
                             {price}
                          </span>
                       </div>
                       {isPaid && <p className="text-xs text-on-surface-variant mt-3 font-medium">Suscripción recurrente. Cancela cuando quieras.</p>}
                    </div>

                    <ul className="flex flex-col gap-4 font-medium text-sm text-on-surface-variant my-2">
                       <li className="flex items-center gap-3"><span className={`material-symbols-outlined text-[18px] ${isPaid ? 'text-amber-500' : 'text-green-500'}`}>check_circle</span> Acceso inmediato al Ecosistema</li>
                       <li className="flex items-center gap-3"><span className={`material-symbols-outlined text-[18px] ${isPaid ? 'text-amber-500' : 'text-green-500'}`}>check_circle</span> Archivos Descargables</li>
                       <li className="flex items-center gap-3"><span className={`material-symbols-outlined text-[18px] ${isPaid ? 'text-amber-500' : 'text-green-500'}`}>check_circle</span> App móvil directa</li>
                       <li className="flex items-center gap-3"><span className={`material-symbols-outlined text-[18px] ${isPaid ? 'text-amber-500' : 'text-green-500'}`}>check_circle</span> Q&A Soporte Privado</li>
                    </ul>

                    <Link href="/dashboard" className="w-full mt-2">
                       <button className={`w-full py-4 rounded-full font-extrabold shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 ${isPaid ? 'bg-amber-500 text-amber-950 shadow-amber-500/20 hover:bg-amber-400' : 'bg-primary text-white hover:bg-primary-container shadow-primary/20'}`}>
                          {isPaid ? 'Desbloquear Acceso' : 'Unirse Gratis Ahora'}
                       </button>
                    </Link>
                    
                 </div>
              </div>

           </div>
        </div>
      </main>

      {/* Floating Mobile Join Button */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-surface border-t border-outline-variant/10 z-40">
          <Link href="/dashboard" className="w-full">
            <button className={`w-full py-3.5 rounded-full text-base font-extrabold shadow-xl active:scale-95 ${isPaid ? 'bg-amber-500 text-amber-950 shadow-amber-500/30' : 'bg-primary text-white shadow-primary/30'}`}>
               Unirse por {price}
            </button>
         </Link>
      </div>

      <BottomNavBar />
    </>
  );
}
