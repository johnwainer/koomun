"use client";

import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import AccessMessage from "@/components/AccessMessage";

type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const mockContacts: ChatUser[] = [
  { id: "1", name: "Esteban D.", avatar: "https://i.pravatar.cc/150?u=e1", lastMessage: "¡Excelente! Nos vemos en la llamada de mañana.", time: "10:45 AM", unread: 2, online: true },
  { id: "2", name: "Valeria M.", avatar: "https://i.pravatar.cc/150?u=v1", lastMessage: "Te envié el enlace por Figma.", time: "Ayer", unread: 0, online: true },
  { id: "3", name: "Carlos J.", avatar: "https://i.pravatar.cc/150?u=c1", lastMessage: "Gracias por la ayuda bro 🚀", time: "Lun", unread: 0, online: false },
  { id: "4", name: "Sofía T.", avatar: "https://i.pravatar.cc/150?u=s1", lastMessage: "¿Pudiste revisar el prototipo?", time: "12 Oct", unread: 0, online: false },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [message, setMessage] = useState("");
  const [authStatus, setAuthStatus] = useState<"pending" | "success" | "unauthorized">("pending");
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
     async function checkAuth() {
        try {
           const res = await fetch("/api/private/chat");
           if (res.status === 401) { setAuthStatus("unauthorized"); return; }
           
           if (res.ok) {
              const data = await res.json();
              if (data.messages && data.messages.length > 0) {
                 // Format actual contacts, but since DB is empty we set empty.
                 setContacts([]);
              } else {
                 setContacts([]);
              }
              setAuthStatus("success");
           }
        } catch(e) { setAuthStatus("unauthorized"); }
     }
     checkAuth();
  }, []);

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-20 pb-16 h-screen flex flex-col bg-surface">
        {authStatus === "pending" ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
           </div>
        ) : authStatus === "unauthorized" ? (
           <AccessMessage type="unauthorized" title="Debes iniciar sesión" description="Inicia sesión para hablar con miembros y creadores de otras comunidades." icon="chat_bubble" />
        ) : contacts.length === 0 ? (
           <div className="flex-1 w-full flex items-center justify-center p-4">
              <AccessMessage type="empty" title="Buzón de Mensajes Vacío" description="Aún no tienes conversaciones con otros usuarios. ¡Ve a explorar comunidades o creadores!" icon="chat" />
           </div>
        ) : (
        <div className="flex-1 max-w-7xl mx-auto w-full flex bg-surface-container-lowest lg:rounded-2xl lg:shadow-sm overflow-hidden border-x border-b lg:border-t lg:my-6 border-outline-variant/10">
          
          {/* Sidebar Chats */}
          <aside className={`w-full md:w-80 border-r border-outline-variant/10 flex-col bg-surface-container-lowest shrink-0 ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
            <header className="p-4 border-b border-outline-variant/10">
              <h2 className="text-xl font-black text-on-surface mb-4">Mensajes Directos</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="w-full bg-surface-container-low text-sm rounded-full pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-primary/30"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {contacts.map((contact) => (
                <button 
                  key={contact.id}
                  onClick={() => { setActiveChat(contact); setShowChatOnMobile(true); }}
                  className={`w-full flex items-center gap-3 p-4 text-left border-b border-outline-variant/5 transition-colors ${
                    activeChat?.id === contact.id ? "bg-primary/5" : "hover:bg-surface-container-low"
                  }`}
                >
                  <div className="relative shrink-0">
                     <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-outline-variant/20" />
                     {contact.online && (
                       <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                     )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                     <div className="flex justify-between items-center mb-1">
                       <h4 className={`text-sm font-bold truncate ${activeChat?.id === contact.id ? "text-primary" : "text-on-surface"}`}>{contact.name}</h4>
                       <span className="text-[10px] text-on-surface-variant font-medium shrink-0 ml-2">{contact.time}</span>
                     </div>
                     <p className={`text-xs truncate ${contact.unread > 0 ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"}`}>
                       {contact.lastMessage}
                     </p>
                  </div>
                  {contact.unread > 0 && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm">
                      {contact.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Active Chat Area */}
          <section className={`flex-1 flex-col bg-[#faf9f7] relative ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
            <header className="px-4 sm:px-6 py-4 border-b border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center z-10 shadow-sm relative">
               <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => setShowChatOnMobile(false)}
                    className="md:hidden flex items-center justify-center p-2 -ml-2 text-outline hover:text-on-surface bg-surface-container-low rounded-full"
                  >
                     <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                  <div className="relative">
                    <img src={activeChat?.avatar} alt={activeChat?.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant/20" />
                    {activeChat?.online && (
                       <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                     )}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface leading-tight">{activeChat?.name}</h3>
                    <p className="text-xs text-on-surface-variant">{activeChat?.online ? 'En línea' : 'Desconectado'}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button className="p-2 text-outline hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
                   <span className="material-symbols-outlined text-[22px]">videocam</span>
                 </button>
                 <button className="p-2 text-outline hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
                   <span className="material-symbols-outlined text-[22px]">info</span>
                 </button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="text-center my-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                  Hoy
                </span>
              </div>
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex max-w-[70%] ${msg.sender === "me" ? "self-end" : "self-start"}`}>
                  <div className={`p-4 rounded-2xl relative ${
                    msg.sender === "me" 
                      ? "bg-primary text-white rounded-br-none" 
                      : "bg-surface-container-lowest border border-outline-variant/10 text-on-surface rounded-bl-none shadow-sm"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-2 block font-medium opacity-70 ${
                      msg.sender === "me" ? "text-right" : "text-left"
                    }`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <footer className="p-4 bg-surface-container-lowest border-t border-outline-variant/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); if(message) { setMessage(""); } }}
                className="flex items-center gap-2 bg-surface-container-low rounded-full p-2 pr-2"
              >
                <button type="button" className="p-2 text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent text-sm outline-none px-2"
                />
                <button 
                  type="submit" 
                  disabled={!message.trim()}
                  className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                    message.trim() ? "bg-primary text-white hover:bg-primary-container" : "bg-surface-container-highest text-outline-variant cursor-not-allowed"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </footer>
          </section>

        </div>
        )}
      </main>
      <BottomNavBar />
    </>
  );
}
