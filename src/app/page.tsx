"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

type Community = {
  id: string;
  title: string;
  description: string;
  category: string;
  members: string;
  price: string;
  image: string;
  creatorAvatar: string;
  creatorUsername: string;
  isElite: boolean;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [mockCommunities, setMockCommunities] = useState<Community[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todas"]);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);

  const categoriesRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const { scrollLeft, clientWidth } = categoriesRef.current;
      const scrollAmount = clientWidth * 0.7; // Desplaza 70% del contenedor visible
      categoriesRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  useEffect(() => {
    async function fetchAll() {
      try {
        const [commRes, catRes] = await Promise.all([
          fetch("/api/communities"),
          fetch("/api/categories")
        ]);

        const commData = await commRes.json();
        const catData = await catRes.json();

        if (catData.categories) {
          setCategories(["Todas", ...catData.categories.map((c: any) => c.name)]);
        }

        if (commData.communities) {
          const mapped = commData.communities.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description || "",
            category: c.category?.name || "Varia",
            members: c.members?.[0]?.count ? c.members[0].count.toString() : "0", 
            price: c.price_tier,
            image: c.cover_image_url || `https://picsum.photos/seed/${c.id}/400/250`,
            creatorAvatar: c.creator?.avatar_url || `https://i.pravatar.cc/150?u=${c.id}`,
            creatorUsername: c.creator?.username || `Creador-${c.id}`,
            isElite: c.creator?.plan === 'elite'
          }));
          setMockCommunities(mapped);
        }
      } catch (e) {
        
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(12); // Resetear paginación al cambiar filtro
  };

  const filteredCommunities =
    activeCategory === "Todas"
      ? mockCommunities
      : mockCommunities.filter((c) => c.category === activeCategory);

  const visibleCommunities = filteredCommunities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCommunities.length;

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:pl-64 pt-24 pb-12 px-6 max-w-screen-2xl mx-auto min-h-screen bg-surface">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
            Descubre tu Comunidad
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Únete a espacios exclusivos creados para creadores, diseñadores e
            innovadores de Latinoamérica. Comparte conocimiento, mejora tus
            habilidades y conecta.
          </p>
        </header>

        <div className="flex flex-col mb-8">
           <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Explorar</h2>
              <div className="flex items-center gap-2 hidden md:flex">
                 <button 
                   onClick={() => scrollCategories('left')}
                   className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                 >
                   <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                 </button>
                 <button 
                   onClick={() => scrollCategories('right')}
                   className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                 >
                   <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                 </button>
              </div>
           </div>
           
           <div 
             ref={categoriesRef}
             className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2"
           >
             {categories.map((category) => (
               <button
                 key={category}
                 onClick={() => handleCategoryChange(category)}
                 className={`px-6 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                   activeCategory === category
                     ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                     : "bg-surface-container-low text-on-surface hover:bg-outline-variant/30"
                 }`}
               >
                 {category}
               </button>
             ))}
           </div>
        </div>

        {!loading && activeCategory === "Todas" && mockCommunities.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
            <Link href={`/c/${mockCommunities[0].title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-lowest h-[400px] block cursor-pointer">
              <img
                alt="Featured Community"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={mockCommunities[0].image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div 
                  className="absolute top-4 right-4 cursor-pointer hover:scale-105 transition-transform"
                  onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     router.push(`/creator/${mockCommunities[0].creatorUsername}`);
                  }}
              >
                <div className={`w-14 h-14 rounded-full border-4 overflow-hidden shadow-2xl bg-surface-container-highest ${mockCommunities[0].isElite ? 'border-zinc-900' : 'border-white/20'}`}>
                   <img src={mockCommunities[0].creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 p-8 text-on-primary">
                {mockCommunities[0].isElite && (
                   <div className="flex gap-2 mb-4">
                     <span className="px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest rounded-full text-white shadow-lg">
                       Comunidad Elite
                     </span>
                   </div>
                )}
                <h2 className="text-3xl font-bold mb-2 text-white">
                   {mockCommunities[0].title}
                </h2>
                <p className="text-white/80 max-w-md text-sm mb-6 leading-relaxed hidden sm:block">
                   {mockCommunities[0].description}
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                    <span className="font-bold text-sm text-white">En Vivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-white/90">
                      group
                    </span>
                    <span className="font-bold text-sm text-white">{mockCommunities[0].members}</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="md:col-span-4 bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between border border-outline-variant/20 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/10">
                   <span className="material-symbols-outlined text-primary text-2xl animate-pulse">local_fire_department</span>
                   <h3 className="text-lg font-extrabold text-on-surface uppercase tracking-tight">Recién Publicadas</h3>
                </div>
                
                <div className="space-y-1 overflow-y-auto pr-2 flex-1 max-h-[260px] custom-scrollbar">
                  {mockCommunities.slice(1, 11).map((trend, i) => (
                    <div
                      onClick={() => router.push(`/c/${trend.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                      key={i}
                      className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-surface-container-high transition-all"
                    >
                      <span className="text-lg font-black text-outline-variant/30 group-hover:text-primary transition-colors w-6 text-center">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate max-w-[160px]">
                          {trend.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] text-on-surface-variant font-medium">
                             {trend.members} miembros
                           </span>
                           <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-1.5 rounded-md">
                             NUEVO
                           </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant/30 group-hover:text-primary/70 text-[18px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 mt-2 border-t border-outline-variant/10">
                   <button className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl transition-colors tracking-wide flex justify-center items-center gap-2">
                     Explorar Comunidades Premium
                   </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-12">
          {activeCategory !== "Todas" && (
            <h2 className="text-2xl font-bold mb-8 text-on-surface">
              Mejores en {activeCategory}
            </h2>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleCommunities.map((community) => (
              <div
                onClick={() => router.push(`/c/${community.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                key={community.id}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full cursor-pointer"
              >
                <div className="relative">
                  <div className="h-40 bg-surface-container-high overflow-hidden relative">
                    <img
                      alt={community.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={community.image}
                      onError={(e) => { e.currentTarget.src = "https://picsum.photos/400/250?blur=2"; }}
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
                    <div 
                        className="relative cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => {
                           e.stopPropagation();
                           router.push(`/creator/${community.creatorUsername}`);
                        }}
                    >
                       <div className={`w-12 h-12 rounded-full border-[3px] bg-surface-container-high overflow-hidden shadow-sm ${community.isElite ? 'border-zinc-900' : 'border-surface-container-lowest'}`}>
                         <img src={community.creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                       </div>
                       {community.isElite && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-[1px] rounded-full shadow border-2 border-surface-container-lowest whitespace-nowrap z-20 md:text-[7px] md:px-2 md:py-0.5">
                             Elite
                          </div>
                       )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 pt-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                            [
                              "text-blue-700 bg-blue-50 border-blue-200",
                              "text-emerald-700 bg-emerald-50 border-emerald-200",
                              "text-amber-700 bg-amber-50 border-amber-200",
                              "text-purple-700 bg-purple-50 border-purple-200",
                              "text-rose-700 bg-rose-50 border-rose-200"
                            ][community.category.length % 5]
                        }`}>
                          {community.category}
                        </span>
                     </div>
                  </div>
                  <h3 className="font-extrabold text-lg text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">
                    {community.title}
                  </h3>
                  <p className="text-on-surface-variant text-xs mb-6 line-clamp-2 leading-relaxed flex-1">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">
                        group
                      </span>
                      <span className="text-xs font-bold">
                        {community.members}
                      </span>
                    </div>
                    {community.price !== 'Gratis' && (
                       <span className={`text-xs font-black px-2 py-0.5 rounded text-on-surface bg-surface-container-highest`}>
                         {community.price}
                       </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
             <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-4xl text-primary mb-2 animate-spin">refresh</span>
                <p className="font-bold text-on-surface-variant">Conectando Mundos...</p>
             </div>
          ) : filteredCommunities.length === 0 && (
             <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">search_off</span>
                <p className="font-bold text-on-surface-variant">No se encontraron comunidades en esta categoría.</p>
             </div>
          )}
          
          {hasMore && (
            <div className="flex justify-center mt-12 mb-8">
               <button 
                onClick={() => setVisibleCount(p => p + 12)}
                className="px-8 py-3 font-bold text-sm bg-surface-container-low text-on-surface hover:bg-surface-container-highest transition-colors rounded-full border border-outline-variant/20 shadow-sm flex items-center gap-2 active:scale-95"
               >
                 <span>Ver Más Comunidades</span>
                 <span className="material-symbols-outlined text-[18px]">expand_more</span>
               </button>
            </div>
          )}

        </section>
      </main>
      <BottomNavBar />
    </>
  );
}
