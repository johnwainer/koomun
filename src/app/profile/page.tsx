"use client";

import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import { supabaseClient } from "@/lib/supabase";

type TabOption = "Cuenta" | "Comunidades" | "Notificaciones" | "Facturación" | "Privacidad";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabOption>("Cuenta");
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ full_name: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchMe() {
       try {
          const { data: { session } } = await supabaseClient.auth.getSession();
          const res = await fetch("/api/private/me", { cache: 'no-store', 
             headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
          });
          if (res.ok) {
             const data = await res.json();
             setUser(data.user);
             if(data.profile) {
                setProfile(data.profile);
             }
          }
       } catch(e) {}
    }
    fetchMe();
  }, []);

  useEffect(() => {
    async function loadCommunities() {
      if (activeTab === "Comunidades") {
        try {
          const res = await fetch('/api/private/my-communities');
          if (res.ok) {
            const data = await res.json();
            setMyCommunities(data.communities || []);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadCommunities();
  }, [activeTab]);
  
  // Payment methods state
  const [savedCards, setSavedCards] = useState<{last4: string; brand: string}[]>([{ last4: '4242', brand: 'Visa' }]);
  const [newCardInput, setNewCardInput] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);

  const handleAddNewCard = () => {
     if(newCardInput.length > 10) {
        setSavedCards([{last4: newCardInput.slice(-4), brand: 'Mastercard'}, ...savedCards]);
        setShowAddCard(false);
        setNewCardInput("");
     }
  };

  const removeCard = (idx: number) => {
     setSavedCards(savedCards.filter((_, i) => i !== idx));
  };

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      <main className="lg:ml-64 pt-24 px-4 md:px-8 pb-24 min-h-screen bg-surface overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* Header del Perfil (Lectura Frontal) */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="h-48 bg-gradient-to-r from-primary-container to-primary"></div>
            <div className="px-8 pb-8 relative">
              <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest absolute -top-16 bg-surface overflow-hidden">
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${user?.email ? user.email.charAt(0) : 'U'}`}
                />
              </div>
              <div className="flex justify-end pt-4">
                <span className="px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full font-bold text-xs uppercase tracking-widest border border-green-500/20">
                  Online
                </span>
              </div>
              <div className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
                   {profile.full_name || "Usuario Koomun"}
                </h1>
                <p className="text-on-surface-variant font-medium mt-1">{user?.email}</p>
                <p className="mt-4 max-w-2xl leading-relaxed text-on-surface-variant">
                  {profile.biography || "Completa tu biografía para que otros sepan más de ti."}
                </p>
                
                <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-outline-variant/10 text-on-surface-variant">
                  <div className="flex gap-2 items-center">
                    <span className="material-symbols-outlined text-outline">location_on</span>
                    <span className="text-sm font-medium">Ubicación oculta</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="material-symbols-outlined text-outline">calendar_month</span>
                    <span className="text-sm font-medium">Se unió recientemente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Zona de Ajustes Integrada al Perfil */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Menú de Tabs Lateral */}
            <aside className="lg:w-64 shrink-0">
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto no-scrollbar lg:sticky lg:top-32 pb-4 lg:pb-0">
                <button 
                  onClick={() => setActiveTab("Cuenta")}
                  className={`text-left shrink-0 px-4 py-3 font-bold rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-colors ${
                    activeTab === "Cuenta" ? "bg-surface-container-low text-on-surface" : "text-on-surface-variant hover:bg-surface-container-lowest font-medium"
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeTab === "Cuenta" ? "text-primary" : ""}`}>person</span>
                  Cuenta
                </button>
                <button 
                  onClick={() => setActiveTab("Comunidades")}
                  className={`text-left shrink-0 px-4 py-3 font-bold rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-colors ${
                    activeTab === "Comunidades" ? "bg-surface-container-low text-on-surface" : "text-on-surface-variant hover:bg-surface-container-lowest font-medium"
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeTab === "Comunidades" ? "text-primary" : ""}`}>groups</span>
                  Comunidades
                </button>
                <button 
                  onClick={() => setActiveTab("Notificaciones")}
                  className={`text-left shrink-0 px-4 py-3 font-bold rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-colors ${
                    activeTab === "Notificaciones" ? "bg-surface-container-low text-on-surface" : "text-on-surface-variant hover:bg-surface-container-lowest font-medium"
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeTab === "Notificaciones" ? "text-primary" : ""}`}>notifications</span>
                  Notificaciones
                </button>
                <button 
                  onClick={() => setActiveTab("Facturación")}
                  className={`text-left shrink-0 px-4 py-3 font-bold rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-colors ${
                    activeTab === "Facturación" ? "bg-surface-container-low text-on-surface" : "text-on-surface-variant hover:bg-surface-container-lowest font-medium"
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeTab === "Facturación" ? "text-primary" : ""}`}>payments</span>
                  Facturación
                </button>
                <button 
                  onClick={() => setActiveTab("Privacidad")}
                  className={`text-left shrink-0 px-4 py-3 font-bold rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-colors ${
                    activeTab === "Privacidad" ? "bg-surface-container-low text-on-surface" : "text-on-surface-variant hover:bg-surface-container-lowest font-medium"
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeTab === "Privacidad" ? "text-primary" : ""}`}>shield</span>
                  Privacidad
                </button>
              </nav>
            </aside>

            {/* Contenido de la Tab Activa */}
            <section className="flex-1 bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 p-6 md:p-8 min-h-[500px]">
              
              {activeTab === "Cuenta" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-8 text-on-surface border-b border-outline-variant/10 pb-4">
                    Edición de Perfil
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-8 mb-10 items-center sm:items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant/30 shrink-0 relative group">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaEjjRsXuqJp0GgwkcLPHbqsE2EmL3vxnuX4W63bZiql8xJY3mY9H-KiDBGYaaBZ3DexhjNBU_vLaFINoHNwT16x30mg0Lv5KMbuWFRXwLr-KoJ4Nwfc0Hb-5VTS1i3so9RmkJJVmNeaObi5KDeDCPAfluyWRYRqNjCBO8HimqWgS2xbSVY4hfAzwSPwwmMjnivufLmKwnF_hHXctW5LVQOM-kkRGXPVUAXCD11XlukyzlAUzm8X38eWqgQPTCR5Qnn0K8WK7DqzTl" alt="Me" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-colors backdrop-blur-[2px]">
                         <span className="material-symbols-outlined text-white">photo_camera</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1 w-full text-center sm:text-left">
                      <h3 className="font-bold text-lg text-on-surface">Foto de Perfil</h3>
                      <p className="text-sm text-on-surface-variant">JPG, GIF o PNG. Max 5MB recomendado 500x500px.</p>
                      <div className="flex gap-3 justify-center sm:justify-start mt-2">
                         <button className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors">Subir</button>
                         <button className="bg-surface-container-high text-on-surface px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/30 transition-colors">Quitar</button>
                      </div>
                    </div>
                  </div>

                  <form className="flex flex-col gap-6 max-w-2xl" onSubmit={async (e) => {
                     e.preventDefault();
                     setSaving(true);
                     await (async () => {
         const { data: { session } } = await supabaseClient.auth.getSession();
         return fetch("/api/private/me", {
            method: "POST",
            body: JSON.stringify(profile),
            headers: { 
               "Content-Type": "application/json",
               ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
            }
         });
      })();
                     setSaving(false);
                  }}>
                    <div className="flex flex-col gap-6">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-on-surface">Nombre Completo</label>
                        <input type="text" value={profile.full_name || ""} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low outline-none focus:border-primary transition-colors text-sm text-on-surface" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-on-surface">Correo Electrónico</label>
                      <div className="relative">
                        <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest text-on-surface-variant outline-none cursor-not-allowed text-sm" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-[18px]">verified</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-on-surface flex justify-between">
                         Biografía
                         <span className="text-xs font-normal text-on-surface-variant">Max. 160 caracteres</span>
                      </label>
                      <textarea rows={4} value={profile.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low outline-none focus:border-primary transition-colors text-sm resize-none text-on-surface" />
                    </div>

                    <button type="submit" disabled={saving} className="self-end mt-4 px-8 py-3 bg-primary text-white rounded-full font-bold text-sm tracking-wide hover:shadow-lg active:scale-95 transition-all disabled:opacity-50">
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "Comunidades" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-8">
                    <h2 className="text-2xl font-bold text-on-surface">
                      Tus Comunidades ({myCommunities.length})
                    </h2>
                    <button className="text-sm font-bold text-primary hover:text-primary-container px-4 py-2 rounded-full border border-primary/20 bg-primary/5 transition-colors">
                      Explorar Nuevas
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myCommunities.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 text-center p-8 text-on-surface-variant text-sm">
                        Cargando o no hay comunidades
                      </div>
                    ) : myCommunities.map((c) => (
                      <article key={c.id} className="flex items-center gap-4 bg-surface-container border border-outline-variant/10 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                        <img src={c.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}`} alt={c.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-outline-variant/20" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-on-surface truncate text-sm">{c.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-bold">Miembro desde Oct. 2024</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                           <button className="px-4 py-1.5 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface uppercase tracking-widest hover:bg-outline-variant/30 transition-colors">
                             Ver
                           </button>
                           <button className="px-4 py-1.5 border border-red-500/30 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors">
                             Salir
                           </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Notificaciones" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-8 text-on-surface border-b border-outline-variant/10 pb-4">
                    Notificaciones
                  </h2>
                  
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                      <div className="max-w-sm">
                        <h4 className="font-bold text-on-surface mb-1 text-sm">Resumen Diario</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Recibe un correo diario con lo más destacado de las comunidades a las que perteneces.</p>
                      </div>
                      <div>
                        <input type="checkbox" defaultChecked className="toggle-checkbox w-10 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                      <div className="max-w-sm">
                        <h4 className="font-bold text-on-surface mb-1 text-sm">Notificaciones de Chat</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Recibe una notificación push en el navegador cuando recibes un Mensaje Directo (DM).</p>
                      </div>
                      <div>
                        <input type="checkbox" defaultChecked className="toggle-checkbox w-10 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                      <div className="max-w-sm">
                        <h4 className="font-bold text-on-surface mb-1 text-sm">Menciones y Respuestas</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Te alertamos de inmediato cada vez que alguien escribe @tusuario o responde a tu comentario.</p>
                      </div>
                      <div>
                        <input type="checkbox" defaultChecked className="toggle-checkbox w-10 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                     <button className="px-6 py-2 bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-widest rounded-full hover:bg-outline-variant/30 transition-colors">Silenciar Todo Mute</button>
                  </div>
                </div>
              )}

              {activeTab === "Facturación" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-8 text-on-surface border-b border-outline-variant/10 pb-4">
                    Facturación y Métodos de Pago
                  </h2>

                  <div className="mb-12 border border-outline-variant/10 rounded-2xl p-6 bg-surface-container-low/50">
                     <h3 className="text-lg font-bold text-on-surface mb-6">Tus Tarjetas</h3>
                     <div className="max-w-xl">
                         <div className="flex flex-col gap-4">
                            {savedCards.map((card, idx) => (
                               <div key={idx} className={`flex justify-between items-center border p-4 rounded-2xl shadow-sm transition-all group ${idx === 0 ? 'bg-primary/5 border-primary/50' : 'bg-surface border-outline-variant/20 hover:border-outline-variant/40'}`}>
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-8 bg-surface-container-high flex items-center justify-center rounded py-1 px-2 shadow-inner text-on-surface text-[10px] font-black uppercase">
                                        {card.brand}
                                     </div>
                                     <div className="text-left leading-tight">
                                        <p className="text-base font-extrabold text-on-surface font-mono">•••• {card.last4}</p>
                                        {idx === 0 && <p className="text-[10px] uppercase font-black tracking-widest text-primary mt-1">Predeterminado</p>}
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     {idx === 0 && <span className="material-symbols-outlined text-primary text-xl hidden sm:block">check_circle</span>}
                                     <button onClick={() => removeCard(idx)} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Eliminar tarjeta">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                     </button>
                                  </div>
                               </div>
                            ))}
                         </div>

                         {showAddCard ? (
                            <div className="mt-6 flex flex-col gap-4 bg-surface-container p-6 rounded-2xl border border-outline-variant/20 animate-in zoom-in-95 duration-200">
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
                               <div className="flex items-center gap-3 mt-2">
                                  <button 
                                     onClick={handleAddNewCard}
                                     className="px-6 py-2.5 bg-primary text-white font-black uppercase tracking-widest rounded-xl text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                  >
                                     Guardar Tarjeta
                                  </button>
                                  <button onClick={() => setShowAddCard(false)} className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl text-xs font-bold text-on-surface">
                                     Cancelar
                                  </button>
                               </div>
                            </div>
                         ) : (
                            <button onClick={() => setShowAddCard(true)} className="mt-6 px-6 py-3 border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all w-full md:w-fit rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary group">
                               <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_card</span>
                               Agregar nuevo método de pago
                            </button>
                         )}
                         <div className="border-t border-outline-variant/10 pt-4 mt-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-green-500">lock</span>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                               Tus datos están encriptados y procesados de manera segura por pagos Stripe
                            </p>
                         </div>
                     </div>
                  </div>

                  <h3 className="font-bold text-lg mb-4 text-on-surface mt-10">Suscripciones Activas</h3>
                  <div className="border border-outline-variant/10 rounded-2xl p-6 bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                     <div>
                       <p className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">Suscripción</p>
                       <h3 className="text-2xl font-extrabold text-on-surface mb-1">Plan Elite (Anual)</h3>
                       <p className="text-xs text-on-surface-variant font-medium">Renueva el 14 Oct. 2025 por $999/año.</p>
                     </div>
                     <button className="whitespace-nowrap px-6 py-2 bg-surface border border-outline-variant/20 rounded-full text-sm font-bold shadow-sm hover:bg-surface-container-high transition-colors text-red-600">
                       Cancelar Plan
                     </button>
                  </div>

                  <h3 className="font-bold text-lg mb-4 text-on-surface">Historial de Pagos</h3>
                  <div className="border border-outline-variant/10 rounded-xl overflow-hidden shadow-sm">
                     <div className="flex justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/50 text-xs font-bold uppercase text-on-surface-variant tracking-widest">
                        <span>Fecha</span>
                        <span>Monto</span>
                        <span>Factura</span>
                     </div>
                     <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/10 text-sm hover:bg-surface-container-lowest transition-colors">
                        <span className="text-on-surface font-medium">14 Oct. 2024</span>
                        <span className="font-black text-on-surface">$999.00</span>
                        <a href="#" className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">download</span></a>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "Privacidad" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-8 text-on-surface border-b border-outline-variant/10 pb-4">
                    Seguridad y Privacidad
                  </h2>

                  <form 
                    className="flex flex-col gap-6 max-w-sm mb-12"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if(!password) return;
                      setSavingPassword(true);
                      const res = await (async () => {
         const { data: { session } } = await supabaseClient.auth.getSession();
         return fetch("/api/private/security", {
            method: "PUT",
            body: JSON.stringify({ password }),
            headers: { 
               "Content-Type": "application/json",
               ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
            }
         });
      })();
                      if(res.ok) {
                        alert("Contraseña actualizada con éxito");
                        setPassword("");
                      }
                      setSavingPassword(false);
                    }}
                  >
                    <h3 className="font-bold text-base text-on-surface">Cambiar Contraseña</h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Nueva Contraseña</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low outline-none focus:border-primary transition-colors text-sm text-on-surface" 
                      />
                    </div>
                    <button type="submit" disabled={savingPassword} className="mt-2 w-full py-3 bg-primary text-white rounded-full font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                      {savingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                    </button>
                  </form>

                  <div className="border-t border-outline-variant/10 pt-10">
                    <h3 className="font-bold text-base text-red-600 mb-2 border-b border-red-500/10 pb-2">Danger Zone</h3>
                    <p className="text-sm text-on-surface-variant mb-6">Una vez elimines tu cuenta, no hay vuelta atrás. Por favor confirma tu decisión cautelósamente.</p>
                    
                    <button 
                      onClick={async () => {
                        if(confirm("¿Estás 100% seguro de que deseas eliminar tu cuenta permanentemente?")) {
                          setDeleting(true);
                          const res = await (async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();
            return fetch("/api/private/security", {
               method: "DELETE",
               headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
            });
         })();
                          if(res.ok) {
                            window.location.href = "/login";
                          } else {
                            alert("Ha ocurrido un error eliminando la cuenta.");
                            setDeleting(false);
                          }
                        }
                      }}
                      disabled={deleting}
                      className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors focus:ring-2 focus:ring-red-500/50 outline-none disabled:opacity-50"
                    >
                      {deleting ? "Eliminando..." : "Eliminar Mi Cuenta"}
                    </button>
                  </div>
                </div>
              )}

            </section>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
