"use client";

import { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import Link from "next/link";
import CommunitySwitcher from "@/components/CommunitySwitcher";

type Member = {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  level: number;
  points: number;
  role: string;
  change: string; // 'up', 'down', 'same'
};

const mockEsteMes: Member[] = [
  { id: 1, rank: 1, name: "Andrés L.", avatar: "https://i.pravatar.cc/150?u=a1", level: 9, points: 3450, role: "Admin", change: "same" },
  { id: 2, rank: 2, name: "Valeria M.", avatar: "https://i.pravatar.cc/150?u=a2", level: 8, points: 2890, role: "Moderador", change: "up" },
  { id: 3, rank: 3, name: "Carlos J.", avatar: "https://i.pravatar.cc/150?u=a3", level: 6, points: 2010, role: "Miembro", change: "up" },
  { id: 4, rank: 4, name: "Sofía T.", avatar: "https://i.pravatar.cc/150?u=a4", level: 5, points: 1850, role: "Miembro", change: "down" },
  { id: 5, rank: 5, name: "Julian R.", avatar: "https://i.pravatar.cc/150?u=a5", level: 5, points: 1720, role: "Miembro", change: "up" },
  { id: 6, rank: 6, name: "María F.", avatar: "https://i.pravatar.cc/150?u=a6", level: 4, points: 1240, role: "Miembro", change: "same" },
  { id: 7, rank: 7, name: "Diego P.", avatar: "https://i.pravatar.cc/150?u=a7", level: 4, points: 1100, role: "Miembro", change: "up" },
  { id: 8, rank: 8, name: "Lucía G.", avatar: "https://i.pravatar.cc/150?u=a8", level: 3, points: 850, role: "Miembro", change: "down" },
  { id: 9, rank: 9, name: "Tomás K.", avatar: "https://i.pravatar.cc/150?u=a9", level: 3, points: 810, role: "Miembro", change: "same" },
  { id: 10, rank: 10, name: "Ana V.", avatar: "https://i.pravatar.cc/150?u=a10", level: 2, points: 620, role: "Miembro", change: "up" }
];

const mockSiempre: Member[] = [
  { id: 1, rank: 1, name: "Andrés L.", avatar: "https://i.pravatar.cc/150?u=a1", level: 9, points: 25450, role: "Admin", change: "same" },
  { id: 4, rank: 2, name: "Sofía T.", avatar: "https://i.pravatar.cc/150?u=a4", level: 8, points: 19850, role: "Miembro", change: "same" },
  { id: 2, rank: 3, name: "Valeria M.", avatar: "https://i.pravatar.cc/150?u=a2", level: 8, points: 18890, role: "Moderador", change: "up" },
  { id: 12, rank: 4, name: "Esteban D.", avatar: "https://i.pravatar.cc/150?u=a12", level: 7, points: 15200, role: "Miembro", change: "down" },
  { id: 3, rank: 5, name: "Carlos J.", avatar: "https://i.pravatar.cc/150?u=a3", level: 6, points: 12010, role: "Miembro", change: "up" },
  { id: 15, rank: 6, name: "Natalia P.", avatar: "https://i.pravatar.cc/150?u=a15", level: 6, points: 11500, role: "Miembro", change: "down" },
  { id: 5, rank: 7, name: "Julian R.", avatar: "https://i.pravatar.cc/150?u=a5", level: 5, points: 9720, role: "Miembro", change: "up" },
  { id: 8, rank: 8, name: "Lucía G.", avatar: "https://i.pravatar.cc/150?u=a8", level: 5, points: 8850, role: "Miembro", change: "same" },
  { id: 18, rank: 9, name: "Héctor B.", avatar: "https://i.pravatar.cc/150?u=a18", level: 4, points: 7200, role: "Miembro", change: "same" },
  { id: 6, rank: 10, name: "María F.", avatar: "https://i.pravatar.cc/150?u=a6", level: 4, points: 6240, role: "Miembro", change: "up" }
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"Este Mes" | "Siempre">("Este Mes");

  const currentData = tab === "Este Mes" ? mockEsteMes : mockSiempre;

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      <main className="lg:pl-64 pt-24 pb-20 px-6 max-w-screen-2xl mx-auto min-h-screen bg-surface">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div>
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
                 Creadores Top
               </h1>
               <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                 Explora nuestro directorio global de creadores y expertos. Conéctate con los líderes que están redefiniendo sus industrias en tiempo real.
               </p>
            </div>
            <div className="shrink-0 flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0">
               <div className="flex justify-center md:justify-end">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 scale-105 cursor-default">
                     <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                     Ranking
                  </span>
               </div>
               <div className="flex flex-wrap justify-center md:justify-end gap-2">
                 {["Destacados", "Mejor Valorados", "A-Z", "Nuevos", "Antiguos"].map((f) => (
                   <Link
                     key={f}
                     href="/creators"
                     className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/60"
                   >
                     {f}
                   </Link>
                 ))}
               </div>
            </div>
          </header>

          <div className="flex justify-center mb-8">
            <div className="bg-surface-container p-1 rounded-full inline-flex border border-outline-variant/10 shadow-inner">
              <button
                onClick={() => setTab("Este Mes")}
                className={`px-10 py-3 rounded-full text-sm font-extrabold transition-all duration-300 ${
                  tab === "Este Mes"
                    ? "bg-primary text-white shadow-xl scale-105"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setTab("Siempre")}
                className={`px-10 py-3 rounded-full text-sm font-extrabold transition-all duration-300 ${
                  tab === "Siempre"
                     ? "bg-primary text-white shadow-xl scale-105"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Histórico Total
              </button>
            </div>
          </div>

          {/* Podium de Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end mt-12 px-4 md:px-12">
             {currentData.slice(0, 3).map((member, i) => (
                <div key={member.rank} className={`bg-gradient-to-b ${i===0 ? 'from-amber-500/10 to-surface-container-lowest border-amber-500/30' : i===1 ? 'from-slate-400/10 to-surface-container-lowest border-slate-400/30' : 'from-orange-600/10 to-surface-container-lowest border-orange-600/30'} rounded-[2.5rem] p-8 flex flex-col items-center relative shadow-2xl border ${i === 0 ? 'md:scale-110 z-20 pb-12' : 'pb-8'} hover:-translate-y-2 transition-transform duration-500`}>
                   
                   <div className="absolute -top-6 bg-surface-container-lowest rounded-full px-4 py-1.5 shadow-md flex items-center justify-center border font-black text-xl z-20">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                   </div>

                   <div className="relative mb-6 mt-4">
                      <div className={`w-28 h-28 rounded-full overflow-hidden border-[4px] shadow-2xl relative z-10 ${i===0?'border-amber-500':i===1?'border-slate-400':'border-orange-600'}`}>
                         <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg z-20 border-2 border-surface-container-lowest">
                         Nvl. {member.level}
                      </div>
                   </div>

                   <h3 className="font-extrabold text-2xl text-on-surface mb-2 tracking-tight">{member.name}</h3>
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md mb-6 ${
                      member.role === 'Admin' ? 'bg-primary/10 text-primary' : 
                      member.role === 'Moderador' ? 'bg-green-500/10 text-green-600' : 'text-on-surface-variant bg-surface-container-high'
                   }`}>
                     {member.role}
                   </span>
                   
                   <div className="mt-auto flex flex-col items-center gap-1 w-full pt-6 border-t border-outline-variant/10">
                      <span className="text-3xl font-black text-on-surface font-mono tracking-tighter">{member.points.toLocaleString()}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Puntos Exp.</span>
                   </div>
                </div>
             ))}
          </div>

          <section className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 overflow-hidden relative">
            <div className="grid grid-cols-12 px-8 py-6 border-b border-outline-variant/10 text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container-high/30 backdrop-blur-md relative z-10">
              <div className="col-span-2 sm:col-span-2 text-center">Posición</div>
              <div className="col-span-6 sm:col-span-6">Usuario & Nivel</div>
              <div className="col-span-4 sm:col-span-4 text-right">Puntuación</div>
            </div>

            <div className="flex flex-col relative z-10 p-4 gap-2 bg-surface">
              {currentData.slice(3).map((member) => (
                <div 
                  key={member.rank} 
                  className="grid grid-cols-12 px-6 py-4 items-center rounded-2xl transition-all hover:bg-surface-container-lowest hover:shadow-md cursor-pointer group bg-surface-container-lowest/50 border border-transparent hover:border-outline-variant/10"
                >
                  <div className="col-span-2 sm:col-span-2 flex justify-center items-center">
                    <span className="text-xl font-black text-outline-variant group-hover:text-primary transition-colors">
                      #{member.rank}
                    </span>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-container-high group-hover:border-primary/30 transition-colors shadow-sm">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-surface-container-highest text-on-surface rounded-full flex items-center justify-center text-[10px] font-black border-2 border-surface-container-lowest shadow-sm">
                        {member.level}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-on-surface leading-snug group-hover:text-primary transition-colors">{member.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest text-on-surface-variant`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-4 sm:col-span-4 flex items-center justify-end gap-3">
                    <span className="text-lg font-black text-on-surface font-mono bg-surface-container-high px-4 py-1.5 rounded-xl">{member.points.toLocaleString()}</span>
                    <div className="flex items-center w-6 justify-center">
                       {member.change === 'up' && <span className="material-symbols-outlined text-[18px] text-green-500 shrink-0 font-bold">trending_up</span>}
                       {member.change === 'down' && <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0 font-bold">trending_down</span>}
                       {member.change === 'same' && <span className="material-symbols-outlined text-[18px] text-outline-variant shrink-0 font-bold">horizontal_rule</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-zinc-900 px-8 py-6 flex items-center justify-between text-white relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
               <div className="flex items-center gap-6 relative z-10 w-full">
                  <div className="w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl">
                    <img src="https://i.pravatar.cc/150?u=current_user" alt="Me" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="font-black text-lg text-white">Tu Posición Actual: #89</p>
                    <p className="text-xs text-white/70 font-bold tracking-wider uppercase mt-1">+150 pts para subir a Nivel 2</p>
                  </div>
                  <div className="shrink-0">
                     <span className="text-2xl font-black text-white font-mono bg-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                        540
                     </span>
                  </div>
               </div>
            </div>

          </section>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
