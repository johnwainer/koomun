"use client";

import { useRouter } from "next/navigation";

interface AccessMessageProps {
  type: "unauthorized" | "empty" | "private";
  title: string;
  description: string;
  icon?: string;
}

export default function AccessMessage({ type, title, description, icon }: AccessMessageProps) {
  const router = useRouter();

  if (type === "unauthorized") {
    return (
      <div className="max-w-7xl w-full mx-auto p-4 flex-1 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-3xl text-amber-500">{icon || "lock"}</span>
        </div>
        <h2 className="text-2xl font-black text-on-surface mb-2 tracking-tight">{title}</h2>
        <p className="text-on-surface-variant font-medium text-center max-w-md mb-6">{description}</p>
        <div className="flex gap-4">
          <button onClick={() => router.push('/login')} className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dark transition-colors">
            Iniciar Sesión
          </button>
          <button onClick={() => router.push('/register')} className="px-6 py-2 bg-surface-container-high text-on-surface font-bold rounded-full border border-outline-variant/20 hover:bg-outline-variant/10 transition-colors">
            Registrarme
          </button>
        </div>
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="max-w-7xl w-full mx-auto p-4 flex-1 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-6 border border-outline-variant/10">
          <span className="material-symbols-outlined text-3xl text-outline-variant">{icon || "group_off"}</span>
        </div>
        <h2 className="text-2xl font-black text-on-surface mb-2 tracking-tight">{title}</h2>
        <p className="text-on-surface-variant font-medium text-center max-w-md mb-6">{description}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-on-surface text-surface font-bold rounded-full hover:scale-105 transition-transform shadow-md">
          Explorar Ecosistemas
        </button>
      </div>
    );
  }

  // private mode for singular locked communities
  return (
    <div className="max-w-7xl w-full mx-auto p-4 flex-1 flex flex-col items-center justify-center min-h-[500px]">
       <span className="material-symbols-outlined text-6xl text-amber-500 mb-4">{icon || "lock"}</span>
       <h2 className="text-2xl font-black text-on-surface mb-2 tracking-tight">{title}</h2>
       <p className="text-on-surface-variant font-medium max-w-sm mb-6 text-center">{description}</p>
       <div className="flex gap-4">
          <button onClick={() => router.push('/login')} className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dark transition-colors">Iniciar Sesión</button>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-surface-container border border-outline-variant/30 text-on-surface rounded-full font-bold hover:bg-surface-container-high transition-colors">Mis Comunidades</button>
       </div>
    </div>
  );
}
