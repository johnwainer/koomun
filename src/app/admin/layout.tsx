export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#faf9f7] text-[#1a1c1b]">
      {/* Sidebar Admin (Very clean & minimal) */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Core Admin</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <a href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container-high text-primary font-bold shadow-sm">
            <span className="material-symbols-outlined text-xl">group</span>
            Usuarios & Creadores
          </a>
          <a href="/admin/content" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-medium">
            <span className="material-symbols-outlined text-xl">dataset</span>
            Gestor Contenidos
          </a>
          <a href="/admin/finance" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-medium">
            <span className="material-symbols-outlined text-xl">monitoring</span>
            Ingresos (MRR)
          </a>
          <a href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-medium">
            <span className="material-symbols-outlined text-xl">build_circle</span>
            Plataforma
          </a>
        </nav>
        
        <footer className="p-4 border-t border-outline-variant/10 text-xs text-on-surface-variant text-center font-medium">
          v1.0.0 — Koomun Systems
        </footer>
      </aside>
      
      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Admin */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/10 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-sm uppercase tracking-widest font-black text-on-surface-variant">
            Infraestructura
          </h2>
          <div className="flex items-center gap-4">
             <button className="text-on-surface-variant hover:text-primary transition-colors">
               <span className="material-symbols-outlined">sync</span>
             </button>
             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 text-primary flex items-center justify-center">
               <span className="text-xs font-black">A</span>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
