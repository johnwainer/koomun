"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

export default function MyCommunitiesPage() {
  const router = useRouter();
  const myCommunities = [
    {
      id: "c1",
      slug: "saas-builders-elite",
      title: "SaaS Builders Elite",
      role: "Miembro Premium",
      type: "Paga",
      members: "12k",
      image: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
      creatorAvatar: "https://i.pravatar.cc/150?u=creator",
      progress: 65,
    },
    {
      id: "c2",
      slug: "react-native-masters",
      title: "React Native Masters",
      role: "Estudiante",
      type: "Gratis",
      members: "5k",
      image: "https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif",
      creatorAvatar: "https://i.pravatar.cc/150?u=react",
      progress: 12,
    },
    {
      id: "c3",
      slug: "ui-design-hackers",
      title: "UI Design Hackers",
      role: "Colaborador",
      type: "Gratis",
      members: "28k",
      image: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
      creatorAvatar: "https://i.pravatar.cc/150?u=design",
      progress: 100,
    }
  ];

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-6 min-h-screen bg-surface">
        <div className="w-full max-w-7xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Mis Comunidades
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">Todos los ecosistemas privados a los que perteneces.</p>
            </div>
            
            <Link href="/">
              <button className="px-6 py-3 border-2 border-outline-variant/30 text-on-surface font-extrabold rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-sm flex items-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">explore</span>
                 Descubrir Más
              </button>
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCommunities.map((community) => (
              <div
                onClick={() => router.push(`/c/${community.slug}`)}
                key={community.id}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col cursor-pointer"
              >
                <div className="relative">
                  <div className="h-40 bg-surface-container-highest overflow-hidden relative">
                    <img
                      alt={community.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      src={community.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-10">
                     {community.type === 'Paga' && (
                       <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 border-amber-500 text-amber-500 bg-amber-500/10 shadow-sm backdrop-blur-md">
                          Comunidad Paga
                       </span>
                     )}
                  </div>

                  <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
                    <div 
                       onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/creator/Creador-${community.id}`);
                       }}
                       className="relative cursor-pointer hover:scale-105 transition-transform"
                    >
                       <div className={`w-16 h-16 rounded-full border-[4px] bg-surface-container overflow-hidden shadow-md ${community.type === 'Paga' ? 'border-zinc-900' : 'border-surface-container-lowest'}`}>
                         <img src={community.creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                       </div>
                       {community.type === 'Paga' && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[7px] font-black uppercase tracking-widest px-2 py-[1px] rounded-full shadow border-2 border-surface-container-lowest whitespace-nowrap z-20">
                             Elite
                          </div>
                       )}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pt-10 flex flex-col flex-1">
                  <h3 className="font-extrabold text-xl text-on-surface mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-2 mt-2">
                    {community.title}
                  </h3>
                  
                  <div className="mt-auto">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-on-surface-variant">Progreso de Aulas</span>
                        <span className="text-xs font-black text-on-surface">{community.progress}%</span>
                     </div>
                     <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 ${community.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                           style={{ width: `${community.progress}%` }}
                        ></div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
