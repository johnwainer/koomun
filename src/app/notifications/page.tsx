"use client";

import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import AccessMessage from "@/components/AccessMessage";

type Notification = {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  read: boolean;
  type: "like" | "comment" | "mention" | "system";
};

const mockNotifs: Notification[] = [
  { id: "1", user: "Valeria M.", avatar: "https://i.pravatar.cc/150?u=v1", action: "comentó en tu post", target: "Framework 2024 para Workshop Design", time: "Hace 10 min", read: false, type: "comment" },
  { id: "2", user: "Andrés L.", avatar: "https://i.pravatar.cc/150?u=a1", action: "te mencionó en", target: "¿Cuál es su stack actual para crear MVPs rápido?", time: "Hace 2 horas", read: false, type: "mention" },
  { id: "3", user: "Sistema", avatar: "https://i.pravatar.cc/150?u=sys", action: "Has desbloqueado un nuevo nivel:", target: "Nivel 2 (Arquitecto)", time: "Hace 1 día", read: true, type: "system" },
  { id: "4", user: "Carlos J.", avatar: "https://i.pravatar.cc/150?u=c1", action: "le dio me gusta a tu comentario en", target: "Mi primer $1k MRR", time: "Hace 2 días", read: true, type: "like" },
  { id: "5", user: "Sofía T.", avatar: "https://i.pravatar.cc/150?u=s1", action: "le dio me gusta a tu post", target: "Framework 2024 para Workshop Design", time: "Hace 2 días", read: true, type: "like" },
];

export default function NotificationsPage() {
  const [authStatus, setAuthStatus] = useState<"pending" | "success" | "unauthorized">("pending");

  useEffect(() => {
     async function checkAuth() {
        try {
           const res = await fetch("/api/private/notifications");
           if (res.status === 401) { setAuthStatus("unauthorized"); return; }
           setAuthStatus("success");
        } catch(e) { setAuthStatus("unauthorized"); }
     }
     checkAuth();
  }, []);

  const unreadCount = mockNotifs.filter(n => !n.read).length;

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen bg-surface flex flex-col">
        {authStatus === "pending" ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
           </div>
        ) : authStatus === "unauthorized" ? (
           <AccessMessage type="unauthorized" title="Debes iniciar sesión" description="Inicia sesión para revisar tus notificaciones y ver quién ha interactuado con tu contenido." icon="notifications" />
        ) : (
        <>
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-4 justify-between border-b border-outline-variant/10 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-on-surface flex flex-wrap items-center gap-2 sm:gap-3">
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full mt-1">
                  {unreadCount} nuevas
                </span>
              )}
            </h1>
          </div>
          <button className="text-xs font-bold text-primary hover:text-primary-container uppercase tracking-widest transition-colors">
            Marcar todas leídas
          </button>
        </header>

        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          {mockNotifs.map((notif, idx) => (
            <div 
              key={notif.id} 
              className={`flex gap-4 p-5 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/5 last:border-0 ${
                !notif.read ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
              }`}
            >
               <div className="relative shrink-0">
                 <img src={notif.avatar} alt={notif.user} className="w-12 h-12 rounded-full border border-outline-variant/20 object-cover" />
                 <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-surface-container-lowest shadow-sm ${
                   notif.type === 'like' ? 'bg-pink-500' :
                   notif.type === 'comment' ? 'bg-zinc-500' :
                   notif.type === 'mention' ? 'bg-purple-500' : 'bg-green-500'
                 }`}>
                   <span className="material-symbols-outlined text-[12px]">
                     {notif.type === 'like' ? 'favorite' :
                      notif.type === 'comment' ? 'chat' :
                      notif.type === 'mention' ? 'alternate_email' : 'star'}
                   </span>
                 </div>
               </div>
               
               <div className="flex-1 flex flex-col justify-center">
                 <p className="text-sm text-on-surface leading-snug">
                   <span className="font-bold">{notif.user}</span> {notif.action} <span className="font-semibold text-primary">{notif.target}</span>
                 </p>
                 <p className="text-xs text-on-surface-variant mt-1 font-medium">{notif.time}</p>
               </div>
               
               {!notif.read && (
                 <div className="flex items-center justify-center shrink-0">
                   <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                 </div>
               )}
            </div>
          ))}
        </section>
        </>
        )}

      </main>
      <BottomNavBar />
    </>
  );
}
