"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";

export type MyCommunity = {
  id: string;
  name: string;
  image: string;
  unreads: number;
  memberCount?: number;
};

// Fetch on mount

interface CommunitySwitcherProps {
  maxWidth?: string;
  activeId?: string;
  onChange?: (community: MyCommunity) => void;
  onLoad?: (communities: MyCommunity[], status: "success" | "unauthorized" | "empty") => void;
}

export default function CommunitySwitcher({ maxWidth = "max-w-7xl", activeId, onChange, onLoad }: CommunitySwitcherProps) {
  const [communities, setCommunities] = useState<MyCommunity[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [internalActiveId, setInternalActiveId] = useState<string>('');

  useEffect(() => {
    async function loadComms() {
       try {
           const { data: { session } } = await supabaseClient.auth.getSession();
          const res = await fetch("/api/private/my-communities", { cache: 'no-store', 
             headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
          });
           if (res.status === 401) {
              if (onLoad) onLoad([], "unauthorized");
              return;
           }
           if (res.ok) {
              const data = await res.json();
              if (data.communities && data.communities.length > 0) {
                 setCommunities(data.communities);
                 if (!activeId) setInternalActiveId(data.communities[0].id);
                 if (onChange && !activeId) onChange(data.communities[0]);
                 if (onLoad) onLoad(data.communities, "success");
              } else {
                 if (onLoad) onLoad([], "empty");
              }
           }
       } catch (e) {
           if (onLoad) onLoad([], "empty");
       }
    }
    loadComms();
  }, []);

  const currentActiveId = activeId || internalActiveId;

  const handleSelect = (c: MyCommunity) => {
    setInternalActiveId(c.id);
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
          {communities.map((c) => (
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
          
          <Link href="/">
             <button className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-outline-variant/50 text-outline-variant hover:text-primary hover:border-primary/50 hover:bg-surface-container-low transition-colors shrink-0 mx-2">
               <span className="material-symbols-outlined">add</span>
             </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
