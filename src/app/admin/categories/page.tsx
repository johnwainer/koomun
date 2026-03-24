"use client";
import { supabaseClient } from "@/lib/supabase";

import { useEffect, useState } from "react";

type InternalCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
  communities: [{ count: number }];
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<InternalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("category");

  const fetchCategories = async () => {
    try {
      const res = await fetch("", { headers: { Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` } });
      const d = await res.json();
      setCategories(d.categories || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newName) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ name: newName, icon: newIcon })
      });
      if (res.ok) {
        setNewName("");
        setNewIcon("category");
        fetchCategories();
      } else {
        alert("Error creando la categoría");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas ELIMINAR la categoría ${name}? Esto desconectará comunidades.`)) return;
    
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert("Hubo un error");
      }
    } catch (e) {
      alert("Error eliminando");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">
            Categorías Globales
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1 max-w-lg">
            Taxonomía raíz del ecosistema. Crea y destruye las categorías en las que los Creadores podrán clasificar su contenido.
          </p>
        </div>
      </header>

      {/* Creación Rápida */}
      <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">add_circle</span>
          Nueva Categoría
        </h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Nombre (ej. Inteligencia Artificial)" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-highest border border-outline-variant/20 rounded-xl outline-none focus:border-primary font-medium"
            />
          </div>
          <div className="w-32">
            <input 
              type="text" 
              placeholder="Icono Material" 
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-highest border border-outline-variant/20 rounded-xl outline-none focus:border-primary text-center font-mono text-sm"
              title="Material Symbols ID"
            />
          </div>
          <button 
            disabled={isCreating}
            onClick={handleCreate}
            className="bg-primary text-white font-bold px-8 rounded-xl hover:bg-primary-container transition-all shadow-md disabled:opacity-50"
          >
            {isCreating ? "..." : "Guardar"}
          </button>
        </div>
      </section>

      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-surface-container-lowest font-medium">
            <thead className="bg-[#faf9f7] text-xs uppercase tracking-widest text-on-surface-variant font-black">
              <tr>
                <th className="p-4 border-b border-outline-variant/10 py-5 w-16 text-center">Icono</th>
                <th className="p-4 border-b border-outline-variant/10">Nombre Comercial</th>
                <th className="p-4 border-b border-outline-variant/10">Slug / URL</th>
                <th className="p-4 border-b border-outline-variant/10 text-center">Comunidades Attachadas</th>
                <th className="p-4 border-b border-outline-variant/10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={5} className="p-10 text-center text-on-surface-variant font-bold">Inyectando Taxonomía...</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors text-sm">
                    <td className="p-4 text-center">
                       <span className="material-symbols-outlined text-outline-variant">{c.icon}</span>
                    </td>
                    <td className="p-4 flex flex-col">
                       <span className="font-bold text-on-surface tracking-tight">{c.name}</span>
                       <span className="text-[10px] text-outline-variant mt-1 font-mono">{c.id}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-primary font-bold">
                       /{c.slug}
                    </td>
                    <td className="p-4 text-center">
                       <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold font-mono">
                         {c.communities?.[0]?.count || 0}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <button onClick={() => handleDelete(c.id, c.name)} className="w-8 h-8 rounded-full border border-outline-variant/20 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center text-outline-variant" title="Forzar Borrado de Categoría">
                         <span className="material-symbols-outlined text-sm">delete_forever</span>
                       </button>
                    </td>
                  </tr>
                ))
              )}
              {categories.length === 0 && !loading && (
                <tr>
                   <td colSpan={5} className="p-10 text-center text-on-surface-variant font-medium">
                     No se detectan categorías en la base de datos.<br/>
                     <span className="text-xs mt-2 opacity-50 block">Corre el SQL de semilla o agrega una manualmente arriba.</span>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
