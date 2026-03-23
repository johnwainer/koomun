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

  const getIconColor = () => {
    if (type === "unauthorized" || type === "private") return "text-amber-500";
    return "text-outline-variant";
  };

  const getPrimaryButton = () => {
    if (type === "empty") {
       return (
          <button onClick={() => router.push('/')} className="px-6 py-2 bg-on-surface text-surface font-bold rounded-full hover:scale-105 transition-transform shadow-md">
            Explorar Comunidades
          </button>
       );
    }
    return (
       <div className="flex gap-4">
          <button onClick={() => router.push('/login')} className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dark transition-colors">
            Iniciar Sesión
          </button>
          <button onClick={() => router.push(type === 'private' ? '/dashboard' : '/register')} className="px-6 py-2 bg-surface-container-high text-on-surface font-bold rounded-full border border-outline-variant/20 hover:bg-outline-variant/10 transition-colors">
            {type === 'private' ? 'Mis Comunidades' : 'Registrarme'}
          </button>
       </div>
    );
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 flex-1 flex flex-col items-center justify-center min-h-[500px]">
      <div className={`w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 shadow-sm border border-outline-variant/10`}>
        <span className={`material-symbols-outlined text-4xl ${getIconColor()}`}>
           {icon || (type === "empty" ? "group_off" : "lock")}
        </span>
      </div>
      <h2 className="text-2xl font-black text-on-surface mb-2 tracking-tight text-center">{title}</h2>
      <p className="text-on-surface-variant font-medium text-center max-w-sm mb-6">{description}</p>
      {getPrimaryButton()}
    </div>
  );
}
