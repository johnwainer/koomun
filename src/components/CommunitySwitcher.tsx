"use client";

import { useState, useRef } from "react";

export type MyCommunity = {
  id: string;
  name: string;
  image: string;
  unreads: number;
};

export const myCommunities: MyCommunity[] = [
  { id: "c1", name: "Colectivo de Diseño", image: "https://picsum.photos/id/111/400/250", unreads: 3 },
  { id: "c2", name: "SaaS Builders", image: "https://picsum.photos/id/121/400/250", unreads: 0 },
  { id: "c3", name: "Prompt Engineers", image: "https://picsum.photos/id/131/400/250", unreads: 12 },
  { id: "c4", name: "Club de Inversores", image: "https://picsum.photos/id/141/400/250", unreads: 0 },
  { id: "c5", name: "Mentes Maestras", image: "https://picsum.photos/id/151/400/250", unreads: 1 },
  { id: "c6", name: "NoCode Founders", image: "https://picsum.photos/id/161/400/250", unreads: 5 },
  { id: "c7", name: "Agencias Web", image: "https://picsum.photos/id/171/400/250", unreads: 0 },
  { id: "c8", name: "UX/UI Masters", image: "https://picsum.photos/id/181/400/250", unreads: 2 },
  { id: "c9", name: "Real Estate LATAM", image: "https://picsum.photos/id/191/400/250", unreads: 0 },
  { id: "c10", name: "Creadores de Contenido", image: "https://picsum.photos/id/201/400/250", unreads: 8 },
  { id: "c11", name: "Marketing B2B", image: "https://picsum.photos/id/211/400/250", unreads: 0 },
  { id: "c12", name: "Startup Grinders", image: "https://picsum.photos/id/221/400/250", unreads: 0 },
  { id: "c13", name: "Indie Hackers", image: "https://picsum.photos/id/231/400/250", unreads: 1 },
  { id: "c14", name: "Crypto Traders", image: "https://picsum.photos/id/241/400/250", unreads: 0 },
  { id: "c15", name: "Ventas B2B", image: "https://picsum.photos/id/251/400/250", unreads: 0 },
];

interface CommunitySwitcherProps {
  maxWidth?: string;
  activeId?: string;
  onChange?: (community: MyCommunity) => void;
}

export default function CommunitySwitcher({ maxWidth = "max-w-7xl", activeId, onChange }: CommunitySwitcherProps) {
  // Use internal state if no props are passed
  const [internalActive, setInternalActive] = useState<MyCommunity>(myCommunities[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentActiveId = activeId || internalActive.id;

  const handleSelect = (c: MyCommunity) => {
    setInternalActive(c);
    if (onChange) onChange(c);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="bg-surface sticky top-16 z-30 py-4 overflow-hidden border-b border-outline-variant/10">
      <div className={`w-full ${maxWidth} mx-auto px-4 lg:px-8`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Mis Comunidades</h2>
          
          <div className="flex items-center gap-2 hidden md:flex">
             <button 
               onClick={() => handleScroll('left')}
               className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
             >
               <span className="material-symbols-outlined text-[18px]">chevron_left</span>
             </button>
             <button 
               onClick={() => handleScroll('right')}
               className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
             >
               <span className="material-symbols-outlined text-[18px]">chevron_right</span>
             </button>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth relative">
          {myCommunities.map((c) => (
            <button 
              key={c.id} 
              onClick={() => handleSelect(c)}
              className={`flex items-center gap-3 p-2 pr-4 rounded-full border transition-all shrink-0 active:scale-95 ${
                currentActiveId === c.id 
                ? "border-primary bg-primary text-white shadow-md shadow-primary/20" 
                : "border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <div className="relative">
                <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full border border-outline-variant/20 object-cover bg-surface-container-high" />
                {c.unreads > 0 && currentActiveId !== c.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-surface-container-lowest shadow-sm">
                    {c.unreads > 9 ? '9+' : c.unreads}
                  </div>
                )}
              </div>
              <span className="text-sm font-bold whitespace-nowrap">{c.name}</span>
            </button>
          ))}
          
          <button className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-outline-variant/50 text-outline-variant hover:text-primary hover:border-primary/50 hover:bg-surface-container-low transition-colors shrink-0 mx-2">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </section>
  );
}
