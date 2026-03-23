
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import { useRouter } from "next/navigation";
import CommunitySwitcher from "@/components/CommunitySwitcher";
import type { MyCommunity } from "@/components/CommunitySwitcher";
import AccessMessage from "@/components/AccessMessage";
import { supabaseClient } from "@/lib/supabase";

// --- Tipos de Datos ---
type Course = {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  author: string;
};

type Lesson = {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string; // YouTube ID o Vimeo ID si es video
  description: string;
  type: "youtube" | "vimeo" | "pdf";
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export default function ClassroomPage() {
  const router = useRouter();
  const [activeCommunity, setActiveCommunity] = useState<MyCommunity | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessState, setAccessState] = useState<"pending" | "success" | "unauthorized" | "empty">("pending");

  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [savedCards, setSavedCards] = useState<{last4: string; brand: string}[]>([{ last4: '4242', brand: 'Visa' }]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [newCardInput, setNewCardInput] = useState("");
  const [showAddCard, setShowAddCard] = useState(savedCards.length === 0);

  useEffect(() => {
    async function loadLibrary() {
      if (!activeCommunity || accessState !== "success") return;
      setLoading(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const res = await fetch(`/api/private/library?communityId=${activeCommunity.id}`, {
           headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
        });
        if (res.status === 401) {
           router.push('/login');
           return;
        }
        if (res.ok) {
           const data = await res.json();
           const mappedCourses = (data.library || []).map((mod: any) => ({
             id: mod.id,
             title: mod.title,
             description: mod.description || 'Sin descripción',
             image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800",
             progress: 0,
             author: activeCommunity.name,
             items: mod.items
           }));
           setCourses(mappedCourses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
  }, [activeCommunity, accessState, router]);

  const handle1ClickPay = () => {
     setIsProcessingPayment(true);
     setTimeout(() => {
        setIsProcessingPayment(false);
        setShowPaywallModal(false);
        // Podríamos simular la descarga aquí cambiando un estado "isPaid"
     }, 1500);
  }

  const handleAddNewCard = () => {
     if(newCardInput.length > 10) {
        setSavedCards([{last4: newCardInput.slice(-4), brand: 'Mastercard'}]);
        setShowAddCard(false);
        setNewCardInput("");
     }
  };

  // Lógica local para simular la vista
  const totalLessons = 0;
  const completedLessons = 0;
  const activeCourseProgress = 0;

  const handleCommunityChange = (c: MyCommunity) => {
     setActiveCommunity(c);
     setActiveCourse(null);
  };

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-16 px-0 sm:px-4 lg:px-8 pb-20 min-h-screen bg-surface flex flex-col relative">
        <CommunitySwitcher 
          maxWidth="max-w-7xl" 
          activeId={activeCommunity?.id} 
          onChange={handleCommunityChange} 
          onLoad={(_, s) => setAccessState(s)} 
        />
        
        {accessState === "unauthorized" && (
           <AccessMessage 
              type="unauthorized" 
              title="Debes iniciar sesión" 
              description="Inicia sesión y obtén el acceso al contenido exclusivo de librerías y programas en tus comunidades." 
              icon="lock" 
           />
        )}

        {accessState === "empty" && (
           <AccessMessage 
              type="empty" 
              title="Librería Vacía" 
              description="Aún no eres miembro de ninguna comunidad para ver sus programas y recursos estructurados de estudio." 
              icon="menu_book" 
           />
        )}

        {accessState === "pending" && (
           <div className="min-h-[300px] w-full flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary">loader</span></div>
        )}

        {accessState === "success" && activeCommunity && (!activeCourse ? (
          // Vista: Grilla de Programas
          <div className="max-w-7xl mx-auto w-full mt-8 px-4 lg:px-8 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
                <h1 className="text-3xl font-extrabold text-on-surface">Librería de {activeCommunity.name}</h1>
                <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                   {courses.length} Programas Activos
                </span>
             </div>
             
             {loading ? (
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">refresh</span>
                  <p className="text-on-surface-variant font-medium">Sincronizando Librería...</p>
                </div>
             ) : courses.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">menu_book</span>
                  <p className="text-on-surface-variant font-medium">Esta comunidad aún no tiene módulos publicados.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                   {courses.map(course => (
                  <article 
                    key={course.id} 
                    onClick={() => setActiveCourse(course)} 
                    className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-outline-variant/30 cursor-pointer transition-all group flex flex-col"
                  >
                     <div className="h-48 relative overflow-hidden bg-surface-container-high">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                              <span className="material-symbols-outlined text-3xl">menu_book</span>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                          Por {course.author}
                        </p>
                        <h2 className="text-xl font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h2>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                          {course.description}
                        </p>
                        
                        <div className="mt-auto">
                           <div className="flex justify-between items-center text-xs font-bold mb-1">
                             <span className={course.progress > 0 ? "text-primary" : "text-on-surface-variant"}>
                               {course.progress === 100 ? "Completado" : course.progress === 0 ? "Sin iniciar" : "En progreso"}
                             </span>
                             <span className="text-on-surface-variant">{course.progress}%</span>
                           </div>
                           <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${course.progress === 100 ? "bg-green-500" : course.progress === 0 ? "bg-transparent" : "bg-primary"}`} 
                               style={{ width: `${course.progress}%` }}
                             ></div>
                           </div>
                        </div>
                     </div>
                  </article>
                ))}
                </div>
             )}
          </div>
        ) : (
          // Vista: Contenido del Programa Específico
          <div className="max-w-7xl mx-auto w-full mt-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 min-h-[calc(100vh-6rem)]">
             
             <div className="px-4 lg:px-8 mt-2">
                <button 
                  onClick={() => setActiveCourse(null)} 
                  className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest w-max bg-surface-container-low px-4 py-2 rounded-full hover:bg-surface-container-high outline-none"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Volver a Librería
                </button>
             </div>

             <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 bg-surface-container-lowest lg:bg-transparent">
                 <aside className="order-last lg:order-first lg:col-span-3 border-r border-outline-variant/10 bg-surface-container-lowest lg:rounded-xl p-4 flex flex-col pt-6 z-10">
                  <h2 className="text-xl font-bold px-2 mb-2 text-on-surface truncate">{activeCourse.title}</h2>
                  <div className="px-2 mb-6">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium mb-2">
                      <span>Tu Progreso</span>
                      <span className="text-primary font-bold">{activeCourseProgress}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{ width: `${activeCourseProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <button 
                          className="flex items-center justify-between w-full text-left p-2 font-bold text-sm text-on-surface hover:text-primary transition-colors outline-none"
                        >
                          <span className="truncate pr-2">Items ({(activeCourse as any).items?.length || 0})</span>
                          <span className="material-symbols-outlined text-[18px]">
                            expand_less
                          </span>
                        </button>
                        
                          <div className="flex flex-col ml-1 border-l-2 border-surface-container-high py-1 transition-all">
                            {((activeCourse as any).items || []).map((lesson: any) => (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`flex items-start gap-3 w-full text-left p-2.5 rounded-lg transition-all outline-none ${
                                  activeLesson?.id === lesson.id
                                    ? "bg-primary-container/20 text-primary font-bold border-l-4 border-primary ml-[-2px]"
                                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface ml-[2px]"
                                }`}
                              >
                                <span className={`material-symbols-outlined text-[16px] mt-0.5 ${
                                  lesson.completed ? "text-green-500" : activeLesson?.id === lesson.id ? "text-primary" : "text-outline-variant"
                                }`}>
                                  {lesson.completed ? (lesson.type === 'pdf' ? "task_alt" : "task_alt") : (lesson.type === 'pdf' ? "picture_as_pdf" : "play_circle")}
                                </span>
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                  <span className="text-sm truncate">{lesson.title}</span>
                                  <span className={`text-[10px] uppercase tracking-widest ${
                                    activeLesson?.id === lesson.id ? "text-primary/70" : "text-on-surface-variant/70"
                                  }`}>{lesson.type || "Elemento"}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                      </div>
                  </div>
                </aside>

                <section className="lg:col-span-9 flex flex-col p-4 lg:p-6 bg-surface-container-lowest lg:rounded-xl shadow-sm border border-outline-variant/10">
                  
                  {!activeLesson ? (
                     <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <span className="material-symbols-outlined text-6xl text-outline-variant/30 mb-4">play_circle</span>
                        <p className="text-on-surface-variant font-bold uppercase tracking-widest">Selecciona una lección para iniciar</p>
                     </div>
                  ) : (
                  <>
                  {/* Visor Dinámico: YouTube, Vimeo o PDF Bloqueado */}
                  {activeLesson.type === "youtube" ? (
                    <div className="w-full aspect-video bg-black rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
                      <iframe 
                        className="w-full h-full border-none" 
                        src={`https://www.youtube.com/embed/${activeLesson.videoUrl}?rel=0&modestbranding=1`}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : activeLesson.type === "vimeo" ? (
                    <div className="w-full aspect-video bg-black rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
                      <iframe 
                        className="w-full h-full border-none" 
                        src={`https://player.vimeo.com/video/${activeLesson.videoUrl}?title=0&byline=0&portrait=0`}
                        title="Vimeo video player" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full aspect-video flex flex-col items-center justify-center relative rounded-xl lg:rounded-2xl border border-outline-variant/20 overflow-hidden bg-surface-container-lowest">
                        <div className="w-full h-full relative">
                           {/* Renderizamos el PDF directamente en iframe desactivando barra de herramientas de navegador */}
                           <iframe 
                             src="/sample.pdf#toolbar=0&navpanes=0&scrollbar=0" 
                             className="w-full h-full border-none pointer-events-none sm:pointer-events-auto"
                             onContextMenu={(e) => e.preventDefault()}
                             title="Visor PDF Protegido"
                           ></iframe>
                           <div className="absolute top-0 right-0 p-4 z-10 pointer-events-none">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">security</span> Protegido</span>
                           </div>
                        </div>
                        
                        <div className="absolute bottom-0 w-full bg-surface-container-low/95 backdrop-blur border-t border-outline-variant/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div className="flex flex-col text-left">
                             <span className="font-bold text-sm text-on-surface">Descarga y Materiales Anexos</span>
                             <span className="text-xs text-on-surface-variant">Este documento es lectura de sitio. Desbloquealo para descargarlo.</span>
                           </div>
                           <button 
                              onClick={() => setShowPaywallModal(true)}
                              className="px-6 py-2 bg-gradient-to-r from-primary-container to-primary text-white font-bold rounded-full uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center shrink-0 gap-2 outline-none"
                           >
                              <span className="material-symbols-outlined text-sm">lock_open</span>
                              Descargar Archivo
                           </button>
                        </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-on-surface mb-3">Sobre este contenido</h3>
                      <p className="text-on-surface-variant leading-relaxed text-lg max-w-3xl">
                        {activeLesson.description}
                      </p>
                      <div className="mt-8 flex items-center gap-4">
                        <button className="px-6 py-3 bg-primary text-white font-bold text-sm uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-2 outline-none">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          Marcar Completado
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center border border-outline-variant/30 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors outline-none">
                          <span className="material-symbols-outlined">bookmark_border</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-outline-variant/10">
                     <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-on-surface">
                       <span className="material-symbols-outlined text-primary">forum</span>
                       Comentarios (12)
                     </h4>
                     <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                          <img src="https://i.pravatar.cc/150?u=current_user" alt="Me" />
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                          <textarea 
                            placeholder="Deja una pregunta o comentario..."
                            className="w-full bg-surface-container-low border border-transparent focus:border-primary/30 p-4 rounded-xl outline-none resize-none h-24 text-sm text-on-surface"
                          ></textarea>
                          <div className="flex justify-end">
                            <button className="px-6 py-2 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-full hover:bg-primary/20 transition-colors outline-none">
                              Comentar
                            </button>
                          </div>
                        </div>
                     </div>
                  </div>
                  </>
                  )}
                </section>
             </div>

          </div>
        ))}

        {/* Modal Paywall */}
        {showPaywallModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-surface rounded-[2rem] max-w-sm w-full shadow-2xl relative border border-outline-variant/20 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="w-full bg-surface-container-lowest p-6 flex flex-col items-center relative overflow-hidden border-b border-outline-variant/10">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                   <button 
                     onClick={() => setShowPaywallModal(false)}
                     className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full transition-colors z-10 border border-outline-variant/10"
                   >
                      <span className="material-symbols-outlined text-lg">close</span>
                   </button>
                   <div className="w-16 h-16 bg-surface-container border border-outline-variant/10 text-primary rounded-2xl flex items-center justify-center mb-3 shadow-md relative z-10">
                      <span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span>
                   </div>
                   <h3 className="text-xl font-black text-on-surface relative z-10">Desbloquear Archivo</h3>
                   <p className="text-sm font-bold text-on-surface-variant relative z-10">$14.99 USD</p>
                </div>

                <div className="p-6 w-full flex flex-col gap-4 bg-surface">
                  {showAddCard ? (
                     <div className="flex flex-col gap-4 text-left w-full relative animate-in slide-in-from-right-4 duration-300">
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">Nombre en la tarjeta</label>
                           <input 
                              type="text" 
                              placeholder="Juan Pérez" 
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors text-on-surface"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">credit_card</span> Número de Tarjeta</label>
                           <input 
                              type="text" 
                              placeholder="0000 0000 0000 0000" 
                              value={newCardInput}
                              onChange={e => setNewCardInput(e.target.value)}
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors text-on-surface font-mono"
                           />
                        </div>
                        <div className="flex gap-4">
                           <div className="flex-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">Vencimiento</label>
                              <input 
                                 type="text" 
                                 placeholder="MM/AA" 
                                 className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors text-on-surface font-mono"
                              />
                           </div>
                           <div className="w-24">
                              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">CVV</label>
                              <input 
                                 type="password" 
                                 placeholder="123" 
                                 className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors text-on-surface font-mono"
                              />
                           </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <input type="checkbox" id="defaultCard" defaultChecked className="accent-primary w-4 h-4 rounded" />
                           <label htmlFor="defaultCard" className="text-xs text-on-surface-variant font-medium cursor-pointer">Establecer como predeterminado</label>
                        </div>
                        <button 
                           onClick={handleAddNewCard}
                           className="mt-2 w-full py-3.5 bg-primary hover:bg-primary-dark transition-colors text-white font-black uppercase tracking-widest rounded-xl text-xs shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                           <span className="material-symbols-outlined text-[16px]">save</span>
                           Guardar Tarjeta
                        </button>
                        {savedCards.length > 0 && (
                           <button onClick={() => setShowAddCard(false)} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors mt-2 font-bold p-2">← Volver a mis métodos</button>
                        )}
                     </div>
                  ) : (
                     <div className="flex flex-col gap-4 w-full animate-in slide-in-from-left-4 duration-300">
                        <div className="flex flex-col gap-3">
                           {savedCards.map((card, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-primary/5 border-2 border-primary/50 p-4 rounded-2xl shadow-sm relative overflow-hidden group">
                                 <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-6 bg-surface-container flex items-center justify-center rounded shadow-inner text-on-surface text-[10px] font-black uppercase">
                                       {card.brand}
                                    </div>
                                    <div className="text-left leading-tight">
                                       <p className="text-sm font-extrabold text-on-surface font-mono">•••• {card.last4}</p>
                                       <p className="text-[9px] uppercase font-black tracking-widest text-primary mt-0.5">Predeterminado</p>
                                    </div>
                                 </div>
                                 <span className="material-symbols-outlined text-primary text-[22px] relative z-10">check_circle</span>
                              </div>
                           ))}
                        </div>
                        
                        <button onClick={() => setShowAddCard(true)} className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors text-left flex items-center gap-1 w-fit p-1 bg-surface-container hover:bg-surface-container-high rounded-lg px-3 py-1.5">
                           <span className="material-symbols-outlined text-[14px]">add</span>
                           Agregar otra tarjeta
                        </button>

                        <button 
                          onClick={handle1ClickPay}
                          disabled={isProcessingPayment}
                          className="w-full mt-2 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/30 hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all text-center flex justify-center items-center h-[56px] relative overflow-hidden"
                        >
                          {isProcessingPayment ? (
                             <span className="material-symbols-outlined animate-spin drop-shadow-md text-[24px]">progress_activity</span>
                          ) : (
                             <>
                                <span className="material-symbols-outlined text-[18px] mr-2">bolt</span>
                                Pagar con 1-Click
                             </>
                          )}
                        </button>
                     </div>
                  )}
                  <div className="border-t border-outline-variant/10 pt-4 mt-2">
                     <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-60">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        Procesado seguro por Stripe
                     </p>
                  </div>
                </div>
             </div>
          </div>
        )}

      </main>
      <BottomNavBar />
    </>
  );
}
