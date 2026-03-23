"use client";

import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import CommunitySwitcher from "@/components/CommunitySwitcher";

type CalendarEvent = {
  id: number;
  date: number; // Day of the month
  type: string;
  title: string;
  time: string;
  attendees: number;
  description: string;
  creator: string;
};

// Generamos algunos mock eventos para este mes dinámico
const mockEvents: CalendarEvent[] = [
  { id: 1, date: 5, type: "Taller", title: "Diseño de Interfaces Web 3.0", time: "10:00 AM - 12:00 PM EST", attendees: 45, description: "Taller interactivo para crear layouts modernos con enfoque B2B SaaS.", creator: "Andrés L." },
  { id: 2, date: 12, type: "Reunión", title: "Review de Proyectos", time: "4:00 PM - 5:30 PM EST", attendees: 120, description: "Revisaremos en vivo los proyectos de la comunidad.", creator: "Valeria M." },
  { id: 3, date: 18, type: "Q&A", title: "Preguntas y Respuestas Mensual", time: "1:00 PM - 2:00 PM EST", attendees: 85, description: "Trae tus preguntas sobre cómo escalar una agencia de diseño a 10k MRR.", creator: "Marcos T." },
  { id: 4, date: 22, type: "Taller", title: "Sistemas de Diseño B2B", time: "11:00 AM - 1:00 PM EST", attendees: 210, description: "Aprende a estructurar un sistema de diseño robusto para tu software empresarial.", creator: "Andrés L." },
  { id: 5, date: 28, type: "Networking", title: "Speed Networking", time: "6:00 PM - 7:00 PM EST", attendees: 60, description: "Dinámicas de conexiones rápidas para conocer a otros creadores y hacer dupla.", creator: "Sistema" }
];

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  useEffect(() => {
    // Al montar en cliente, seteamos la fecha (Ej: 22 de marzo 2026 según el sistema de prueba)
    const today = new Date("2026-03-22T12:00:00");
    setCurrentDate(today);
    setSelectedDate(today.getDate());
    setMounted(true);
  }, []);

  const changeMonth = (direction: number) => {
    if (!currentDate) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  if (!mounted || !currentDate) {
    return <div className="min-h-screen bg-surface"></div>;
  }

  const targetYear = currentDate.getFullYear();
  const targetMonth = currentDate.getMonth();

  const daysInMonthTotal = new Date(targetYear, targetMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay(); // 0 (Domingo) - 6 (Sábado)
  
  // Asumimos Lunes(1) como primer día, Domingo es 0 -> lo pasamos a 7 para el cálculo
  const firstDay = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;
  const emptyOffset = firstDay - 1; // Espacios vacíos antes del día 1
  
  const daysInMonthArray = Array.from({ length: daysInMonthTotal }, (_, i) => i + 1);
  const emptyDaysArray = Array.from({ length: emptyOffset }, (_, i) => i);

  // Filtramos los eventos por día (mock)
  const eventsByDate = mockEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<number, CalendarEvent[]>);

  const selectedEvents = selectedDate && eventsByDate[selectedDate] 
    ? eventsByDate[selectedDate] 
    : []; 

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-16 pb-20 bg-surface min-h-screen flex flex-col">
        <CommunitySwitcher maxWidth="max-w-7xl" />

        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 pt-8 flex flex-col lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 gap-8 flex-1 animate-in fade-in duration-300">
          
          <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface">
                Calendario de Eventos
              </h1>
              
              <div className="flex items-center bg-surface-container-low rounded-full font-bold shadow-sm border border-outline-variant/10 overflow-hidden">
                <button onClick={() => changeMonth(-1)} className="w-12 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="px-6 flex items-center justify-center min-w-[160px] border-x border-outline-variant/10">
                  <span className="text-sm font-extrabold text-on-surface tracking-wider uppercase">
                    {MONTH_NAMES[targetMonth]} {targetYear}
                  </span>
                </div>
                <button onClick={() => changeMonth(1)} className="w-12 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </header>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 relative">
              <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest border-b border-outline-variant/10 pb-4">
                <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
              </div>
              <div className="grid grid-cols-7 gap-2 lg:gap-3">
                {emptyDaysArray.map((_, idx) => (
                  <div key={`empty-${idx}`} className="p-2 aspect-square"></div>
                ))}
                
                {daysInMonthArray.map((day) => {
                  const dayEvents = eventsByDate[day];
                  const hasEvents = dayEvents && dayEvents.length > 0;
                  const isSelected = selectedDate === day;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === targetMonth && new Date().getFullYear() === targetYear;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`relative flex flex-col items-center justify-center rounded-xl font-bold transition-all text-sm aspect-square border-2 active:scale-95 ${
                        isSelected 
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10" 
                          : isToday
                          ? "border-primary text-primary hover:bg-primary/5"
                          : "border-transparent text-on-surface hover:bg-surface-container hover:border-outline-variant/30"
                      }`}
                    >
                      <span className={`${isSelected ? 'text-white' : ''}`}>{day}</span>
                      
                      {hasEvents && (
                        <div className="flex gap-1 absolute bottom-2">
                          {dayEvents.map((e, idx) => (
                            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : (e.type === 'Taller' ? 'bg-amber-500' : e.type === 'Reunión' ? 'bg-green-500' : 'bg-purple-500')}`}></span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4 order-last mt-4 lg:mt-0">
            <h4 className="text-xl font-bold text-on-surface border-b border-outline-variant/10 pb-4 mb-2 flex items-center justify-between">
              <span>{selectedDate ? `${selectedDate} de ${MONTH_NAMES[targetMonth]}` : "Próximos Eventos"}</span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                {selectedEvents.length}
              </span>
            </h4>
            
            <div className="flex gap-2 flex-wrap mb-4">
               <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg text-[10px] font-bold uppercase tracking-widest text-amber-700 border border-amber-200/50"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Talleres</span>
               <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg text-[10px] font-bold uppercase tracking-widest text-green-700 border border-green-200/50"><span className="w-2 h-2 rounded-full bg-green-500"></span>Reuniones</span>
               <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg text-[10px] font-bold uppercase tracking-widest text-purple-700 border border-purple-200/50"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Q&A</span>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
              {selectedEvents.length === 0 ? (
                <div className="p-10 text-center bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/20 text-on-surface-variant flex flex-col items-center gap-3 shadow-inner">
                  <span className="material-symbols-outlined text-4xl opacity-50">event_busy</span>
                  <span className="font-bold text-sm uppercase tracking-widest">Día libre</span>
                  <p className="text-xs">No hay eventos programados para esta fecha.</p>
                </div>
              ) : (
                selectedEvents.map((evt) => (
                  <article key={evt.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:border-primary/30">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${evt.type === 'Taller' ? 'bg-amber-500' : evt.type === 'Reunión' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                    
                    <div className="flex items-center justify-between mb-3">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 border ${
                         evt.type === 'Taller' ? 'bg-amber-50 text-amber-700 border-amber-200' : evt.type === 'Reunión' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                       }`}>
                         <span className="material-symbols-outlined text-[12px]">{evt.type === 'Taller' ? 'design_services' : evt.type === 'Reunión' ? 'groups' : 'chat'}</span>
                         {evt.type}
                       </span>
                    </div>

                    <h3 className="font-extrabold text-on-surface text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{evt.title}</h3>
                    
                    <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 mb-4 bg-surface-container py-1.5 px-3 rounded-lg w-max border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                      {evt.time}
                    </p>
                    
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                      {evt.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <img className="w-7 h-7 rounded-full border border-outline-variant/30" src={`https://i.pravatar.cc/150?u=${evt.creator}`} alt={evt.creator} />
                        <span className="text-xs font-bold text-on-surface tracking-wide">{evt.creator}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full text-[10px] font-bold text-on-surface-variant">
                         <span className="material-symbols-outlined text-[12px]">group</span>
                         {evt.attendees}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>

        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
