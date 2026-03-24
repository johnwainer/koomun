"use client";
import { supabaseClient } from "@/lib/supabase";

import { useEffect, useState } from "react";

type InternalCommunity = {
  id: string;
  title: string;
  price_tier: string;
  is_published: boolean;
  created_at: string;
  creator: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
  category: {
    name: string;
  };
};

export default function AdminContentPage() {
  const [communities, setCommunities] = useState<InternalCommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch("", { headers: { Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` } });
        const d = await res.json();
        setCommunities(d.communities || []);
        setLoading(false);
      } catch (error) {
        console.error("No se pudo contactar al API Core");
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const handleToggleStatus = async (id: string, currentlyPublished: boolean) => {
    try {
      const res = await fetch('/api/admin/communities', {
        method: 'PATCH',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ id, is_published: !currentlyPublished })
      });
      if (res.ok) {
        setCommunities(communities.map(c => c.id === id ? { ...c, is_published: !currentlyPublished } : c));
      } else {
        alert("Error cambiando estado");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el Universo "${title}" de forma PERMANENTE e irrecuperable?`)) return;
    try {
      const res = await fetch('/api/admin/communities', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setCommunities(communities.filter(c => c.id !== id));
      } else {
        alert("Error al eliminar la comunidad");
      }
    } catch (e) {
      alert("Error de red");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">
            Gestor de Comunidades y Contenido
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1 max-w-lg">
            Supervisa, audita y modera la información pública. Oculta contenido sin borrarlo físicamente mediante RLS bypass.
          </p>
        </div>
        <button className="bg-primary text-white font-bold px-6 py-2.5 rounded-full hover:bg-primary-container hover:-translate-y-0.5 transition-all shadow-md">
           + Nueva Categoría Global
        </button>
      </header>

      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm overflow-hidden mt-4">
        <header className="px-6 py-4 border-b border-outline-variant/10 flex justify-between bg-surface-container-low">
          <input 
             type="text" 
             placeholder="Buscar título de producto/comunidad... (Frontend API Consume)" 
             className="bg-surface-container p-2 px-4 rounded-full text-sm outline-none w-80 font-medium"
          />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left bg-surface-container-lowest font-medium">
            <thead className="bg-[#faf9f7] text-xs uppercase tracking-widest text-on-surface-variant font-black">
              <tr>
                <th className="p-4 border-b border-outline-variant/10 py-5">Nombre de la Comunidad</th>
                <th className="p-4 border-b border-outline-variant/10">Creador</th>
                <th className="p-4 border-b border-outline-variant/10">Categoría</th>
                <th className="p-4 border-b border-outline-variant/10">Estado</th>
                <th className="p-4 border-b border-outline-variant/10 text-right">Moderación</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={5} className="p-10 text-center text-on-surface-variant font-bold">Cargando Universos mediante REST API...</td>
                </tr>
              ) : (
                communities.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors text-sm">
                    <td className="p-4 flex flex-col">
                       <span className="font-bold text-on-surface tracking-tight">{c.title}</span>
                       <span className="text-primary font-black text-xs">{c.price_tier}</span>
                       <span className="text-[10px] text-outline-variant mt-1 font-mono">{c.id}</span>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                          <img src={c.creator?.avatar_url || 'https://i.pravatar.cc/150'} className="w-6 h-6 rounded-full" />
                          <span className="text-xs font-bold text-on-surface">{c.creator?.full_name || 'Desconocido'}</span>
                       </div>
                    </td>
                    <td className="p-4 text-xs font-black uppercase text-on-surface-variant">
                       {c.category?.name || 'Varia'}
                    </td>
                    <td className="p-4">
                       <span className={`px-3 py-1 text-[11px] font-black uppercase rounded-full ${c.is_published ? 'bg-green-500/20 text-green-700' : 'bg-amber-500/20 text-amber-700'}`}>
                         {c.is_published ? 'Publicado' : 'En Borrador'}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => handleToggleStatus(c.id, c.is_published)}
                             className={`w-8 h-8 rounded-full border border-outline-variant/20 transition-colors flex items-center justify-center ${c.is_published ? 'hover:border-amber-500 hover:text-amber-600 text-outline-variant' : 'hover:border-green-500 hover:text-green-600 border-amber-500 text-amber-500'}`} 
                             title={c.is_published ? "Suspender Visibilidad" : "Hacer Público"}
                           >
                             <span className="material-symbols-outlined text-sm">{c.is_published ? 'visibility_off' : 'visibility'}</span>
                           </button>
                           <button 
                             onClick={() => handleDelete(c.id, c.title)}
                             className="w-8 h-8 rounded-full border border-outline-variant/20 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center text-outline-variant" 
                             title="Purgar (Hard Delete)"
                           >
                             <span className="material-symbols-outlined text-sm">delete_forever</span>
                           </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
