"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import { supabaseClient } from "@/lib/supabase";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccessMessage from "@/components/AccessMessage";

export default function CommunityLandingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [community, setCommunity] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [accessError, setAccessError] = useState(false);

  useEffect(() => {
     async function loadCommunity() {
        try {
           const { data: { session } } = await supabaseClient.auth.getSession();
          const res = await fetch(`/api/private/communities/${slug}`, { cache: 'no-store', 
             headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
          });
           if (res.status === 401) {
              setAccessError(true);
              setLoading(false);
              return;
           }
           if (res.status === 403) {
              setAccessError(true);
              setLoading(false);
              return;
           }
           if (res.ok) {
              const data = await res.json();
              setCommunity(data.community);
              setEvents(data.events || []);
              setIsMember(data.isMember || false);
           }
        } catch(e) {
           console.error(e);
        } finally {
           setLoading(false);
        }
     }
     loadCommunity();
  }, [slug, router]);

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-surface">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
       </div>
     );
  }

  if (accessError) {
     return (
       <>
         <TopNavBar />
         <SideNavBar />
         <main className="lg:ml-64 pt-16 bg-surface min-h-screen flex flex-col">
            <AccessMessage 
               type="unauthorized" 
               title="Debes iniciar sesión" 
               description="Inicia sesión o regístrate para visualizar esta comunidad y unirte a ella." 
               icon="lock" 
            />
         </main>
         <BottomNavBar />
       </>
     );
  }

  const handleJoin = async () => {
     if (isMember) {
        router.push('/dashboard');
        return;
     }

     setJoining(true);
     try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const res = await fetch(`/api/private/communities/${slug}`, {
           method: "POST",
           headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
        });
        if (res.ok) {
           router.push('/dashboard');
        } else {
           const err = await res.json();
           console.error("Join Error:", err);
           alert("Hubo un error al intentar unir a la comunidad.");
        }
     } catch(e) {
        console.error(e);
     } finally {
        setJoining(false);
     }
  };

  const handleLeave = async () => {
     if (!community) return;
     setShowLeaveModal(false);
     setLeaving(true);
     try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return router.push('/login');
        const res = await fetch(`/api/private/communities/${encodeURIComponent(slug)}/leave`, {
           method: "DELETE",
           headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
           router.push('/dashboard');
        } else {
           const err = await res.json();
           console.error("Leave Error:", err);
           alert(err.error || "Hubo un error al intentar salir.");
        }
     } catch(e) {
        console.error(e);
     } finally {
        setLeaving(false);
     }
  };

  if (!community) return null;

  const isPaid = community.price_tier?.toLowerCase() !== 'gratis';
  const price = isPaid ? community.price_tier : "Gratis";
  
  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-16 bg-surface min-h-screen">
        
        {/* Banner Area (Pure Image, no text overlay) */}
        <div className="w-full h-32 md:h-64 bg-surface-container-highest relative overflow-hidden">
           {/* Cover Image */}
           <img 
              src={community.cover_image_url || (isPaid ? "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" : "https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif")} 
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
                 <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-[4px] md:border-[6px] bg-surface-container-highest shadow-xl overflow-hidden ${community.creator?.plan?.toLowerCase() === 'elite' ? 'border-zinc-900' : 'border-surface'}`}>
                    <img src={community.creator?.avatar_url || `https://i.pravatar.cc/150?u=${community.id}`} alt="Creator Avatar" className="w-full h-full object-cover" />
                 </div>
                 {community.creator?.plan?.toLowerCase() === 'elite' && (
                    <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg border-2 border-surface-container-lowest whitespace-nowrap z-20">
                       Elite
                    </div>
                 )}
              </div>
              
              <div className="hidden md:block pb-2">
                  {isPaid && (
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 border-amber-500 text-amber-500 bg-amber-500/5`}>
                       Comunidad Privada
                    </span>
                  )}
              </div>
           </div>

           {/* Title & Info */}
           <div className="mb-12">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
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
                 <span className="text-xs font-black tracking-widest uppercase flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">group</span> {community.members?.[0]?.count ? community.members[0].count : '0'} miembros
                 </span>
                 {isPaid && (
                  <span className="md:hidden px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-amber-500 text-amber-500">
                     {community.price_tier}
                  </span>
                 )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter leading-tight mb-4">
                 {community.title}
              </h1>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-3xl whitespace-pre-line">
                 {community.description || "Únete a una comunidad enfocada en el progreso continuo."}
              </p>
           </div>

           {/* Two columns layout: Details & CTA Box */}
           <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 pb-28 md:pb-16">
              
              {/* Left Column: Details */}
              <div className="flex flex-col gap-10">
                 <section>
                    <h2 className="text-2xl font-bold text-on-surface mb-6">Acerca de este Ecosistema</h2>
                    <p className="text-on-surface-variant leading-relaxed text-base mb-4 whitespace-pre-line">
                       {community.description}
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
                       {events.length === 0 ? (
                          <div className="text-center p-8 bg-surface-container border border-outline-variant/10 rounded-2xl text-on-surface-variant">
                             No hay eventos próximos agendados.
                          </div>
                       ) : events.map(evt => (
                          <div key={evt.id} className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-surface-container-high/30 border border-outline-variant/10 hover:border-primary/30 transition-colors group">
                             <div className="shrink-0 w-16 h-16 rounded-xl bg-surface-container-highest flex flex-col items-center justify-center text-center shadow-inner">
                                <span className="text-xl font-black text-on-surface leading-none">{evt.event_date?.split('-')[2]}</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">MES</span>
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">{evt.type?.includes('Virtual') ? 'videocam' : 'location_on'}</span> {evt.type}</span>
                                </div>
                                <h4 className="font-bold text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">{evt.title}</h4>
                                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                                   <span className="material-symbols-outlined text-[14px]">schedule</span> {evt.event_time}
                                </p>
                             </div>
                             <div className="shrink-0 flex items-center md:items-start pt-2 md:pt-0">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full whitespace-nowrap">Exclusivo Miembros</span>
                             </div>
                          </div>
                       ))}
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

                    <button 
                       onClick={handleJoin}
                       disabled={joining || leaving}
                       className={`w-full mt-2 py-4 rounded-full font-extrabold shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isPaid && !isMember ? 'bg-amber-500 text-amber-950 shadow-amber-500/20 hover:bg-amber-400' : 'bg-primary text-white hover:bg-primary-container shadow-primary/20'}`}>
                       {joining ? 'Procesando...' : isMember ? 'Ir a la Comunidad' : isPaid ? 'Desbloquear Acceso' : 'Unirse Gratis Ahora'}
                    </button>

                    {isMember && (
                        <button 
                           onClick={() => setShowLeaveModal(true)}
                           disabled={leaving}
                           className="w-full text-xs text-red-500 font-bold hover:underline transition-colors mt-2 text-center"
                        >
                           {leaving ? 'Abandonando...' : 'Abandonar esta comunidad'}
                        </button>
                    )}
                    
                 </div>
              </div>

           </div>
        </div>

        {/* Sober Leave Modal Checkout equivalent */}
        {showLeaveModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 pb-2 text-center flex flex-col items-center">
                   <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 shrink-0">
                      <span className="material-symbols-outlined text-2xl">logout</span>
                   </div>
                   <h3 className="text-xl font-bold text-on-surface mb-2">Abandonar Comunidad</h3>
                   <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                      ¿Estás seguro de que deseas salir de <strong className="text-on-surface line-clamp-1 break-words">{community.title}</strong>? <br/><br/>
                      Si lo haces, se borrará toda tu actividad y progreso registrado en ella de forma irreversible.
                   </p>
                </div>
                <div className="p-6 pt-6 flex flex-col gap-3">
                   <button 
                      onClick={handleLeave}
                      className="w-full py-3.5 rounded-full font-extrabold text-white bg-red-500 hover:bg-red-600 shadow shadow-red-500/20 active:scale-95 transition-all"
                   >
                      Sí, abandonar
                   </button>
                   <button 
                      onClick={() => setShowLeaveModal(false)}
                      className="w-full py-3.5 rounded-full font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                   >
                      Cancelar
                   </button>
                </div>
             </div>
           </div>
        )}
      </main>

      {/* Floating Mobile Join Button */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-surface border-t border-outline-variant/10 z-40">
           <button 
                onClick={handleJoin}
                disabled={joining}
                className={`w-full py-3.5 rounded-full text-base font-extrabold shadow-xl active:scale-95 disabled:opacity-50 ${isPaid && !isMember ? 'bg-amber-500 text-amber-950 shadow-amber-500/30' : 'bg-primary text-white shadow-primary/30'}`}>
                {joining ? 'Procesando...' : isMember ? 'Ir al Dashboard' : isPaid ? `Unirse por ${price}` : 'Unirse Gratis'}
             </button>
      </div>

      <BottomNavBar />
    </>
  );
}
