"use client";
import { supabaseClient } from "@/lib/supabase";

export default function AdminLibraryPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black tracking-tight text-on-surface">Gestor de Librería y Cursos</h1>
         <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2 opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined text-[18px]">build</span> En Desarrollo
         </button>
      </div>

      <div className="bg-surface-container-low/50 rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col items-center justify-center py-24 text-center">
         <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">inventory_2</span>
         <h2 className="text-xl font-extrabold text-on-surface mb-2">Módulos y Lecciones</h2>
         <p className="text-on-surface-variant max-w-md">
            Esta sección agrupará la creación de contenido modular (videos, PDF, texto) dentro de las comunidades. Proximamente.
         </p>
      </div>
    </div>
  );
}
