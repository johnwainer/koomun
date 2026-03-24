"use client";
import { supabaseClient } from "@/lib/supabase";

import { useEffect, useState } from "react";

export default function AdminFeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("", { headers: { Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` } });
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateMock = async () => {
     setLoading(true);
     await fetch("/api/admin/feed", { method: 'POST', body: JSON.stringify({ mock: true }) });
     await fetchPosts();
  };

  const deletePost = async (id: string) => {
     if(!confirm('Borrar post?')) return;
     setLoading(true);
     await fetch(`/api/admin/feed?id=${id}`, { method: 'DELETE' });
     await fetchPosts();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black tracking-tight text-on-surface">Gestor de Muro Global</h1>
         <button disabled={loading} onClick={generateMock} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">magic_button</span> Inyectar Mocks
         </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-on-surface-variant font-medium">Sincronizando...</div>
        ) : posts.length === 0 ? (
           <div className="p-8 text-center text-on-surface-variant font-medium">Bandeja Vacía. Usa Inyectar Mocks para auto-generar feed social.</div>
        ) : (
           <table className="w-full text-left text-sm">
             <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-black tracking-widest">
               <tr>
                 <th className="p-4">Contenido</th>
                 <th className="p-4">Autor</th>
                 <th className="p-4">Comunidad</th>
                 <th className="p-4">Reacciones</th>
                 <th className="p-4 text-right">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/10">
               {posts.map((p) => (
                 <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                   <td className="p-4 font-bold text-primary max-w-xs truncate">{p.content}</td>
                   <td className="p-4 text-on-surface-variant">{p.author?.full_name}</td>
                   <td className="p-4 text-xs bg-surface-container px-2 py-1 rounded inline-block mt-3">{p.community?.title}</td>
                   <td className="p-4 font-black">{p.likes} 👍</td>
                   <td className="p-4 text-right">
                     <button onClick={() => deletePost(p.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg font-bold">
                       <span className="material-symbols-outlined text-[16px]">delete</span>
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );
}
