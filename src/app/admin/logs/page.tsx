"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  created_at: string;
  actor?: {
    full_name: string;
    email: string;
    role: string;
  };
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/admin/logs');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (e) {
        console.error("Error fetching logs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
       <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">
            Registro de Auditoría (Logs)
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1 max-w-lg">
            Monitoreo en tiempo real de cada movimiento, edición o acción crítica ejecutada en Koomun.
          </p>
        </div>
      </header>

      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm overflow-hidden mt-4">
         <div className="overflow-x-auto max-h-[700px]">
           <table className="w-full text-left bg-surface-container-lowest font-medium relative">
             <thead className="bg-[#faf9f7] text-xs uppercase tracking-widest text-on-surface-variant font-black sticky top-0 z-10 shadow-sm">
               <tr>
                 <th className="p-4 border-b border-outline-variant/10">Fecha / Hora</th>
                 <th className="p-4 border-b border-outline-variant/10">Actor</th>
                 <th className="p-4 border-b border-outline-variant/10">Acción</th>
                 <th className="p-4 border-b border-outline-variant/10">Entidad Afectada</th>
                 <th className="p-4 border-b border-outline-variant/10">Metadatos Internos</th>
               </tr>
             </thead>
             <tbody>
               {loading && (
                 <tr>
                    <td colSpan={5} className="p-10 text-center text-on-surface-variant font-bold">Cargando Historial...</td>
                 </tr>
               )}
               {logs.map((log) => (
                 <tr key={log.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors text-sm">
                   <td className="p-4 text-xs font-mono text-on-surface-variant">
                     {new Date(log.created_at).toLocaleString()}
                   </td>
                   <td className="p-4">
                      {log.actor ? (
                        <div className="flex flex-col">
                           <span className="font-bold text-on-surface">{log.actor.full_name}</span>
                           <span className="text-[10px] text-primary uppercase font-black">{log.actor.role}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant font-bold italic">Sistema / API</span>
                      )}
                   </td>
                   <td className="p-4">
                      <span className="bg-surface-container-highest px-3 py-1 font-bold rounded-md text-xs tracking-wider">
                         {log.action}
                      </span>
                   </td>
                   <td className="p-4">
                      <div className="flex flex-col">
                         <span className="font-bold uppercase tracking-tight text-xs text-on-surface-variant">{log.entity_type}</span>
                         <span className="text-[10px] text-outline-variant font-mono mt-1">{log.entity_id || 'N/A'}</span>
                      </div>
                   </td>
                   <td className="p-4">
                      <pre className="text-[10px] font-mono bg-surface-container px-2 py-1 rounded text-on-surface-variant max-w-[200px] overflow-hidden whitespace-nowrap overflow-ellipsis">
                         {JSON.stringify(log.metadata)}
                      </pre>
                   </td>
                 </tr>
               ))}
               {!loading && logs.length === 0 && (
                 <tr>
                    <td colSpan={5} className="p-10 text-center text-on-surface-variant font-medium">No se detecta flujo de acciones aún.</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
