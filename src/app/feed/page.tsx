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
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("General");
  const [isPosting, setIsPosting] = useState(false);
  const [myAvatar, setMyAvatar] = useState("");
  const [myName, setMyName] = useState("");
  const [myUserId, setMyUserId] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      if (!activeCommunity || accessState !== "success") return;
      setLoading(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user?.user_metadata?.avatar_url) {
           setMyAvatar(session.user.user_metadata.avatar_url);
        }
        if (session?.user) {
           setMyUserId(session.user.id);
           setMyName(session.user.user_metadata?.full_name || session.user.email || "U");
        }
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

  const handlePost = async () => {
    if (!activeCommunity || !newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch(`/api/private/feed`, {
         method: 'POST',
         headers: session ? { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` } : { 'Content-Type': 'application/json' },
         body: JSON.stringify({ communityId: activeCommunity.id, content: newPostContent, type: newPostType })
      });
      if (res.ok) {
         setNewPostContent("");
         setNewPostType("General");
      }
    } catch(err) {
       console.error(err);
    } finally {
       setIsPosting(false);
       // Hacky refetch
       const { data: { session } } = await supabaseClient.auth.getSession();
       fetch(`/api/private/feed?communityId=${activeCommunity.id}`, { headers: session ? { Authorization: `Bearer ${session.access_token}` } : {} })
         .then(r => r.json())
         .then(d => setPosts(d.posts || []));
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic cache update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch(`/api/private/feed/${postId}/like`, {
         method: 'POST',
         headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if (res.ok) {
         const data = await res.json();
         // sync the real backend state immediately to fix optimism misalignments
         setPosts(prev => prev.map(p => 
            p.id === postId ? { ...p, likes_count: data.likes } : p
         ));
      } else {
         // Revert on error
         setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } : p));
      }
    } catch(err) {
       console.error(err);
    }
  };

  const handleDeletePost = async () => {
    if(!deletingPostId) return;
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch(`/api/private/feed/${deletingPostId}`, {
         method: 'DELETE',
         headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if(res.ok) setPosts(prev => prev.filter(p => p.id !== deletingPostId));
    } catch(err) { console.error(err); } finally {
      setDeletingPostId(null);
    }
  };

  const handleSaveEdit = async (postId: string) => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch(`/api/private/feed/${postId}`, {
         method: 'PUT',
         headers: session ? { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` } : { 'Content-Type': 'application/json' },
         body: JSON.stringify({ content: editingContent })
      });
      if(res.ok) {
         setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editingContent } : p));
         setEditingPostId(null);
      }
    } catch(err) { console.error(err); }
  };

  const filters = ["Todos", "General", "Preguntas", "Recursos", "Showcase"];

  // Placeholder filters implementation since we don't have types on the db model yet
  const filteredPosts = activeFilter === "Todos" 
    ? posts 
    : posts.filter(p => p.media_url === activeFilter);

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
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black uppercase flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/20">
                  {myAvatar ? (
                    <img alt="Me" src={myAvatar} className="w-full h-full object-cover" />
                  ) : (
                    myName.charAt(0)
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={isPosting}
                    placeholder={`Escribe algo a ${activeCommunity.name}${isPosting ? ' (Publicando...)' : '...'}`}
                    className="w-full text-left px-4 py-3 bg-surface-container-low rounded-lg text-on-surface transition-colors text-sm font-medium outline-none border border-transparent focus:border-outline-variant/30 disabled:opacity-50 min-h-[80px] resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={newPostType}
                      onChange={(e) => setNewPostType(e.target.value)}
                      className="bg-surface-container hover:bg-surface-container-highest cursor-pointer text-xs font-bold text-on-surface-variant px-3 py-1.5 rounded-full outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Preguntas">Preguntas</option>
                      <option value="Recursos">Recursos</option>
                      <option value="Showcase">Showcase</option>
                    </select>
                    <button 
                      onClick={handlePost}
                      disabled={isPosting || !newPostContent.trim()}
                      className="bg-on-surface text-surface px-5 py-1.5 rounded-full text-sm font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                    >
                      {isPosting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
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
                        <div className="flex gap-3 items-start">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-outline-variant/20 overflow-hidden cursor-pointer shrink-0 bg-primary/10 text-primary font-black uppercase flex items-center justify-center">
                            {post.author?.avatar_url ? (
                               <img alt={post.author?.full_name} src={post.author.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                               (post.author?.full_name || 'U').charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface leading-tight hover:text-primary cursor-pointer transition-colors text-sm sm:text-base">
                              {post.author?.full_name || 'Desconocido'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 font-medium">
                              <span className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface">
                                 {post.media_url || 'General'}
                              </span>
                              <span>• Hace un momento</span>
                            </div>
                          </div>
                        </div>
                        {post.author?.id === myUserId && (
                          <div className="relative">
                            <button onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)} className="p-1.5 hover:bg-surface-container-low rounded-full transition-colors text-outline-variant hover:text-on-surface">
                              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                            </button>
                            {activeMenuId === post.id && (
                               <div className="absolute right-0 top-full mt-1 w-32 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg z-10 py-1 flex flex-col overflow-hidden">
                                  <button onClick={() => { setEditingPostId(post.id); setEditingContent(post.content); setActiveMenuId(null); }} className="px-4 py-2 text-xs font-bold text-left hover:bg-surface-container-low text-on-surface transition-colors flex items-center gap-2">
                                     <span className="material-symbols-outlined text-[14px]">edit</span> Editar
                                  </button>
                                  <button onClick={() => { setDeletingPostId(post.id); setActiveMenuId(null); }} className="px-4 py-2 text-xs font-bold text-left hover:bg-rose-500/10 text-rose-600 transition-colors flex items-center gap-2">
                                     <span className="material-symbols-outlined text-[14px]">delete</span> Eliminar
                                  </button>
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {editingPostId === post.id ? (
                        <div className="mb-4">
                           <textarea className="w-full min-h-[100px] border border-outline-variant/30 rounded-xl p-3 text-sm focus:border-primary outline-none bg-surface-container-lowest text-on-surface resize-none mb-2 font-medium" value={editingContent} onChange={e => setEditingContent(e.target.value)} />
                           <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingPostId(null)} className="px-4 py-1.5 text-xs font-bold rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancelar</button>
                              <button onClick={() => handleSaveEdit(post.id)} className="px-4 py-1.5 text-xs font-bold rounded-full bg-primary text-white hover:bg-primary/90 shadow-sm transition-colors">Guardar</button>
                           </div>
                        </div>
                      ) : (
                        <p className="text-on-surface-variant leading-relaxed mb-4 text-sm sm:text-base whitespace-pre-line text-on-surface">
                          {post.content}
                        </p>
                      )}
                    </div>

                    <div className="px-5 sm:px-6 py-3 bg-[#faf9f7] border-t border-outline-variant/10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
                          <span className="material-symbols-outlined text-[20px] group-active:scale-90 transition-transform">
                            thumb_up
                          </span>
                          <span className="text-sm font-bold">{post.likes_count || 0}</span>
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
                    {activeCommunity.memberCount || 5}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-1">
                    Miembros
                  </div>
                </div>
                <div className="bg-[#faf9f7] p-4 rounded-xl flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-inner">
                  <div className="text-2xl font-black text-green-600">
                    {Math.max(1, Math.floor((activeCommunity.memberCount || 5) * 0.15))}
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

      {/* Modal Eliminar Post */}
      {deletingPostId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface border border-outline-variant/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 shrink-0">
                 <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">¿Eliminar publicación?</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-8">Esta acción es permanente y no podrás recuperar este post ni suspender las interacciones vinculadas a él.</p>
              
              <div className="flex w-full gap-3">
                 <button onClick={() => setDeletingPostId(null)} className="flex-1 py-3 px-4 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-bold rounded-xl text-sm">
                    Cancelar
                 </button>
                 <button onClick={handleDeletePost} className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 text-white font-bold rounded-xl text-sm">
                    Sí, Eliminar
                 </button>
              </div>
           </div>
        </div>
      )}

      <BottomNavBar />
    </>
  );
}
