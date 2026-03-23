"use client";

import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import AccessMessage from "@/components/AccessMessage";
import { supabaseClient } from "@/lib/supabase";

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
export default function NotificationsPage() {
  const [authStatus, setAuthStatus] = useState<"pending" | "success" | "unauthorized">("pending");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
     async function loadData() {
        try {
           const { data: { session } } = await supabaseClient.auth.getSession();
          const res = await fetch("/api/private/notifications", {
             headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
          });
           if (res.status === 401) { setAuthStatus("unauthorized"); return; }
           
           if (res.ok) {
              const data = await res.json();
              setNotifications(data.notifications || []);
              setAuthStatus("success");
           }
        } catch(e) { setAuthStatus("unauthorized"); }
     }
     loadData();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          {notifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-70">
              <span className="material-symbols-outlined text-4xl mb-4 text-outline-variant">notifications_paused</span>
              <p className="font-bold text-on-surface-variant">No tienes notificaciones pendientes.</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
             <div 
               key={notif.id} 
               className={`flex gap-4 p-5 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/5 last:border-0 ${
                 !notif.is_read ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
               }`}
             >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full border border-outline-variant/20 flex flex-col justify-center items-center overflow-hidden">
                     {notif.actor?.avatar_url ? (
                        <img src={notif.actor.avatar_url} alt="actor" className="w-full h-full object-cover" />
                     ) : (
                        <span className="material-symbols-outlined text-outline-variant">person</span>
                     )}
                  </div>
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
                    <span className="font-bold">{notif.actor?.full_name || "Alguien"}</span> {notif.action_text} <span className="font-semibold text-primary">{notif.target_text}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 font-medium">{new Date(notif.created_at).toLocaleDateString()}</p>
                </div>
                
                {!notif.is_read && (
                  <div className="flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  </div>
                )}
             </div>
            ))
          )}
        </section>
        </>
        )}

      </main>
      <BottomNavBar />
    </>
  );
}
