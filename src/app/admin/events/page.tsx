"use client";

import { useEffect, useState } from "react";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const generateMock = async () => {
     setLoading(true);
     await fetch("/api/admin/events", { method: 'POST', body: JSON.stringify({ mock: true }) });
     await fetchEvents();
  };

  const deleteEvent = async (id: string) => {
     if(!confirm('Borrar evento?')) return;
     setLoading(true);
     await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
     await fetchEvents();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black tracking-tight text-on-surface">Gestor de Eventos</h1>
         <button disabled={loading} onClick={generateMock} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">magic_button</span> Inyectar Mocks
         </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-on-surface-variant font-medium">Sincronizando...</div>
        ) : events.length === 0 ? (
           <div className="p-8 text-center text-on-surface-variant font-medium">Vacío. Usa Inyectar Mocks para auto-generar datos si no hay interfaz de creador aún.</div>
        ) : (
           <table className="w-full text-left text-sm">
             <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-black tracking-widest">
               <tr>
                 <th className="p-4">Evento</th>
                 <th className="p-4">Comunidad</th>
                 <th className="p-4">Fecha</th>
                 <th className="p-4 text-right">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/10">
               {events.map((e) => (
                 <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors">
                   <td className="p-4 font-bold text-primary">{e.title}</td>
                   <td className="p-4 text-on-surface-variant">{e.community?.title}</td>
                   <td className="p-4">{e.event_date} - {e.event_time}</td>
                   <td className="p-4 text-right">
                     <button onClick={() => deleteEvent(e.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg font-bold">
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
