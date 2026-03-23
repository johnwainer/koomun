"use client";

import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

type Post = {
  id: number;
  author: string;
  avatar: string;
  time: string;
  type: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
};

import CommunitySwitcher, { MyCommunity } from "@/components/CommunitySwitcher";
import { useRouter } from "next/navigation";
import AccessMessage from "@/components/AccessMessage";
import { supabaseClient } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [activeCommunity, setActiveCommunity] = useState<MyCommunity | null>(null);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessState, setAccessState] = useState<"pending" | "success" | "unauthorized" | "empty">("pending");

  useEffect(() => {
    async function loadFeed() {
      if (!activeCommunity || accessState !== "success") return;
      setLoading(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const res = await fetch(`/api/private/feed?communityId=${activeCommunity.id}`, {
           headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
        });
        if (res.status === 401) {
           router.push('/login');
           return;
        }
        if (res.ok) {
           const data = await res.json();
           setPosts(data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [activeCommunity, accessState, router]);

  const filters = ["Todos", "Preguntas", "Recursos", "Showcase"];

  // Placeholder filters implementation since we don't have types on the db model yet
  const filteredPosts = activeFilter === "Todos" 
    ? posts 
    : [];

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      
      <main className="lg:ml-64 pt-16 pb-20 bg-surface min-h-screen">
        
        {/* Nav de Mis Comunidades */}
        <CommunitySwitcher 
           maxWidth="max-w-7xl" 
           activeId={activeCommunity?.id} 
           onChange={(c) => setActiveCommunity(c)} 
           onLoad={(_, s) => setAccessState(s)} 
        />

        {accessState === "unauthorized" && (
           <AccessMessage 
              type="unauthorized" 
              title="Debes iniciar sesión" 
              description="Tu feed global se nutre de las comunidades a las que perteneces. Inicia sesión o crea una cuenta."
              icon="lock" 
           />
        )}

        {accessState === "empty" && (
           <AccessMessage 
              type="empty" 
              title="Tu feed está vacío" 
              description="Aún no eres miembro de ninguna comunidad. Únete a comunidades increíbles para ver contenido exclusivo." 
              icon="group_add" 
           />
        )}

        {accessState === "pending" && (
           <div className="min-h-[300px] w-full flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary">loader</span></div>
        )}

        {accessState === "success" && activeCommunity && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 flex flex-col lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 gap-8">
          
          <div className="flex flex-col gap-6">
            
            <header className="mb-2">
              <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface">{activeCommunity.name}</h1>
            </header>

            {/* Input Post Area */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                  <img alt="Me" src="https://i.pravatar.cc/150?u=current_user" />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder={`Escribe algo a ${activeCommunity.name}...`}
                    className="w-full text-left px-5 py-3 bg-surface-container-low rounded-full text-on-surface hover:bg-surface-container-highest transition-colors text-sm font-medium outline-none border border-transparent focus:border-outline-variant/30"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant group">
                    <span className="material-symbols-outlined group-hover:text-primary">image</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant group">
                    <span className="material-symbols-outlined group-hover:text-primary">videocam</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors border shadow-sm ${
                    activeFilter === filter
                      ? "bg-on-surface text-surface border-on-surface"
                      : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {loading ? (
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">refresh</span>
                  <p className="text-on-surface-variant font-medium">Cargando Muro...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">forum</span>
                  <p className="text-on-surface-variant font-medium">Aún no hay publicaciones en esta categoría de la comunidad.</p>
                  <button className="mt-6 px-6 py-2 bg-on-surface text-surface font-bold rounded-full hover:bg-zinc-800 transition-colors">
                    Ser el primero
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article key={post.id} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden relative transition-shadow hover:shadow-md">
                    <div className="p-5 sm:p-6 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-outline-variant/20 overflow-hidden cursor-pointer shrink-0">
                            <img alt={post.author?.full_name} src={post.author?.avatar_url || `https://i.pravatar.cc/150?u=${post.id}`} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface leading-tight hover:text-primary cursor-pointer transition-colors text-sm sm:text-base">
                              {post.author?.full_name || 'Desconocido'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 font-medium">
                              <span>Hace un momento</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-1.5 hover:bg-surface-container-low rounded-full transition-colors text-outline-variant hover:text-on-surface">
                          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>
                      </div>
                      
                      <p className="text-on-surface-variant leading-relaxed mb-4 text-sm sm:text-base whitespace-pre-line text-on-surface">
                        {post.content}
                      </p>
                    </div>

                    <div className="px-5 sm:px-6 py-3 bg-[#faf9f7] border-t border-outline-variant/10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
                          <span className="material-symbols-outlined text-[20px] group-active:scale-90 transition-transform">
                            thumb_up
                          </span>
                          <span className="text-sm font-bold">{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
                          <span className="material-symbols-outlined text-[20px] group-active:scale-90 transition-transform">
                            chat_bubble
                          </span>
                          <span className="text-sm font-bold">{post.comments || 0}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <h4 className="text-on-surface font-extrabold mb-4 flex items-center gap-2 text-lg">
                <span className="material-symbols-outlined text-lg">
                  analytics
                </span>
                Métricas del Grupo
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#faf9f7] p-4 rounded-xl flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-inner">
                  <div className="text-2xl font-black text-on-surface">
                    {activeCommunity.id === 'c1' ? '12.4k' : activeCommunity.id === 'c2' ? '8.9k' : activeCommunity.id === 'c3' ? '15k' : '5k'}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-1">
                    Miembros
                  </div>
                </div>
                <div className="bg-[#faf9f7] p-4 rounded-xl flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-inner">
                  <div className="text-2xl font-black text-green-600">
                    {activeCommunity.id === 'c1' ? '842' : activeCommunity.id === 'c2' ? '320' : activeCommunity.id === 'c3' ? '1.2k' : '45'}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <h4 className="text-on-surface font-extrabold mb-4 text-lg">Sobre {activeCommunity.name}</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Este es un espacio central para coordinar aprendizaje, intercambiar valor y acelerar tu networking enfocado de lleno en las exigencias del mercado Tech y Startups LATAM.
              </p>
              <div className="flex gap-2 mt-6 flex-wrap">
                <span className="px-3 py-1 bg-surface-container-low text-[10px] rounded border border-outline-variant/20 uppercase font-bold text-on-surface">Oficial</span>
                <span className="px-3 py-1 bg-surface-container-low text-[10px] rounded border border-outline-variant/20 uppercase font-bold text-on-surface">Network</span>
              </div>
            </section>
            
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <h4 className="text-on-surface font-extrabold mb-4 text-lg flex justify-between items-center">
                Líderes
                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Ver Todos</span>
              </h4>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full border border-outline-variant/30 object-cover" src="https://i.pravatar.cc/150?u=admin1" alt="admin" />
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-tight">Andrés L.</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-outline-variant mt-0.5">Admin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full border border-outline-variant/30 object-cover" src="https://i.pravatar.cc/150?u=mod1" alt="mod" />
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-tight">Valeria M.</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-green-600 mt-0.5">Moderador</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>

        </div>
        )}
      </main>
      <BottomNavBar />
    </>
  );
}
