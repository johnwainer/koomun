"use client";

import { useEffect, useState } from "react";

type InternalUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  plan: string;
  created_at: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);

  // CONSUMO API REST CREADA (Listo para Apps Móviles o Web Frontend)
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users', {
            // Ejemplo de requerimiento Authorization que puedes inyectar 
            // headers: { Authorization: `Bearer admin-token-1234` }
        });
        const d = await res.json();
        setUsers(d.users || []);
        setLoading(false);
      } catch (error) {
        console.error("No se pudo contactar al API Core");
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">
            Usuarios de Plataforma
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1 max-w-lg">
            Gestor completo de cuentas, acceso a bases de datos y suspensiones vía Supabase Service Role.
          </p>
        </div>
        <button className="bg-primary text-white font-bold px-6 py-2.5 rounded-full hover:bg-primary-container hover:-translate-y-0.5 transition-all shadow-md">
           + Nuevo Usuario Manual
        </button>
      </header>

      {/* Tarjeta Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 rounded-2xl shadow-sm text-center">
             <span className="material-symbols-outlined text-green-500 mb-2 text-3xl">public</span>
             <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Activos Totales</h3>
             <p className="text-4xl font-black text-primary mt-1">{loading ? "..." : users.length}</p>
         </div>
         <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 rounded-2xl shadow-sm text-center">
             <span className="material-symbols-outlined text-yellow-500 mb-2 text-3xl">military_tech</span>
             <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Creadores Elite</h3>
             <p className="text-4xl font-black text-primary mt-1">{loading ? "..." : users.filter(u => u.plan === 'elite').length}</p>
         </div>
         <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 rounded-2xl shadow-sm text-center">
             <span className="material-symbols-outlined text-amber-600 mb-2 text-3xl">gavel</span>
             <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Bloqueados</h3>
             <p className="text-4xl font-black text-primary mt-1">0</p>
         </div>
      </div>

      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm overflow-hidden mt-4">
        <header className="px-6 py-4 border-b border-outline-variant/10 flex justify-between bg-surface-container-low">
          <input 
             type="text" 
             placeholder="Buscar email, nombre... (Frontend API Consume)" 
             className="bg-surface-container p-2 px-4 rounded-full text-sm outline-none w-80 font-medium"
          />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left bg-surface-container-lowest font-medium">
            <thead className="bg-[#faf9f7] text-xs uppercase tracking-widest text-on-surface-variant font-black">
              <tr>
                <th className="p-4 border-b border-outline-variant/10 py-5">Nombre y Email</th>
                <th className="p-4 border-b border-outline-variant/10">Rol Asignado</th>
                <th className="p-4 border-b border-outline-variant/10">Plan</th>
                <th className="p-4 border-b border-outline-variant/10">Registrado</th>
                <th className="p-4 border-b border-outline-variant/10 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={5} className="p-10 text-center text-on-surface-variant font-bold">Cargando Data mediante REST API...</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors text-sm">
                    <td className="p-4 flex flex-col">
                       <span className="font-bold text-on-surface tracking-tight">{u.full_name}</span>
                       <span className="text-on-surface-variant text-xs">{u.email}</span>
                       <span className="text-[10px] text-outline-variant mt-1 font-mono">{u.id}</span>
                    </td>
                    <td className="p-4">
                       <span className={`px-3 py-1 text-[11px] font-black uppercase rounded-full ${u.role === 'creator' ? 'bg-primary/20 text-primary' : 'bg-zinc-200 text-zinc-600'}`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="p-4 text-xs font-black uppercase">
                       {u.plan === 'elite' ? <span className="text-amber-600 flex items-center gap-1"><span className="material-symbols-outlined text-xs">workspace_premium</span> ELITE</span> : u.plan}
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant">
                       {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                       <button className="w-8 h-8 rounded-full border border-outline-variant/20 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center text-outline-variant">
                         <span className="material-symbols-outlined text-sm">block</span>
                       </button>
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
