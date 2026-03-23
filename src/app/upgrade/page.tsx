"use client";

import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";

export default function UpgradePage() {
  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-6 min-h-screen bg-surface flex flex-col items-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-16 text-center">
             <div className="flex items-center justify-center gap-2 mb-4 text-amber-500">
                 <span className="material-symbols-outlined text-sm font-bold">workspace_premium</span>
                 <p className="text-xs font-black uppercase tracking-widest">Planes de Creador</p>
             </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
              Escala tu Ecosistema sin Límites
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
              Empieza gratis embebiendo contenido de terceros. Sube a Elite cuando necesites el ecosistema completo de hosting propio de video y documentos ilimitados.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
            
            {/* PLAN GRATIS */}
            <article className="bg-surface border-2 border-outline-variant/20 rounded-3xl p-8 flex flex-col shadow-sm transition-all h-full">
              <h3 className="text-2xl font-bold text-on-surface mb-2">Creador PREMIUM (Gratis)</h3>
              <p className="text-sm font-medium text-on-surface-variant mb-6 border-b border-outline-variant/10 pb-4">Inicia tu Comunidad de inmediato</p>
              
              <div className="mb-8 flex flex-col">
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black text-on-surface">$0</span>
                   <span className="text-on-surface-variant font-medium text-sm"> / para siempre</span>
                </div>
                <span className="text-xs text-on-surface-variant mt-2 font-medium italic">Sin costos pasivos de alojamiento.</span>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm font-medium text-on-surface-variant mb-12 flex-1">
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-green-500 shrink-0">check_circle</span> <span className="font-bold text-on-surface">Embeds ilimitados de YouTube/Vimeo sin coste</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-green-500 shrink-0">check_circle</span> <span>Diseño visual de Landing Page & Embudo</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-green-500 shrink-0">check_circle</span> <span>Cobrar Membresías vía Stripe Connect</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-amber-500 shrink-0">warning</span> <span>Límite estricto de 1 archivo PDF en total (Muestra)</span></li>
                 <li className="flex items-start gap-3 opacity-60"><span className="material-symbols-outlined text-[18px] text-outline-variant shrink-0">cancel</span> <span>Imposible subir Videos nativos formato MP4</span></li>
              </ul>
              
              <Link href="/studio">
                 <button className="w-full py-4 border-2 border-outline-variant/30 text-on-surface font-extrabold rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-sm tracking-wide">
                   Plan Actual Activo
                 </button>
              </Link>
            </article>

            {/* PLAN ELITE */}
            <article className="bg-surface-container-lowest border-2 border-primary/50 relative rounded-3xl p-8 flex flex-col shadow-2xl transition-all scale-100 hover:scale-[1.02] h-full overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">El más Elite</span>
              </div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

              <h3 className="text-2xl font-bold text-on-surface mb-2">Creador ELITE</h3>
              <p className="text-sm font-medium text-primary mb-6 border-b border-outline-variant/10 pb-4">Potencia Operativa Profesional y Hosting</p>
              
              <div className="mb-8 flex flex-col">
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black text-on-surface">$49</span>
                   <span className="text-on-surface-variant font-medium text-sm"> / mes</span>
                </div>
                <span className="text-xs text-on-surface-variant mt-2 font-medium italic">Todo el hosting premium de tu negocio está cubierto.</span>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm font-medium text-on-surface-variant mb-12 flex-1 relative z-10">
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span className="font-bold text-on-surface text-primary text-[15px]">100% PDFs Seguros Ilimitados</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span className="font-bold text-on-surface text-primary text-[15px] flex items-center gap-1">Aro de Estatus Oscuro y Autoridad Visual Global</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span className="font-bold text-on-surface text-primary text-[15px]">Portadas en GIF Animado (Atrae +300% de clicks)</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span className="font-bold text-on-surface text-primary text-[15px]">Hosting de Video Nativo a máxima calidad</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span>Protección DRM Anti-Descarga avanzada global</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span className="font-bold text-on-surface text-primary text-[15px]">Portafolio Avanzado en el Directorio de Creadores</span></li>
                 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <span>Mapeo a tu propio Dominio Personal (SSL Global Cifrado)</span></li>
              </ul>
              
              <button className="w-full py-4 bg-primary text-white font-extrabold rounded-full hover:bg-primary-container shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm tracking-wide relative z-10 flex items-center justify-center gap-2">
                Subir a Plan ELITE <span className="material-symbols-outlined text-[18px]">verified</span>
              </button>
            </article>

          </section>
          
          <div className="text-center pb-8 border-t border-outline-variant/10 pt-12 max-w-xl mx-auto flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant/50">storefront</span>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              El plan PREMIUM tiene grandes márgenes porque no hay costos pasivos altos; delega toda tu carga pesada en infraestructuras públicas de YouTube/Vimeo. Al cambiar a Elite, la plataforma procesa, cifra el almacenamiento nativo de múltiples gigas y retransmite en stream directo tus propiedades intelectuales.
            </p>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
