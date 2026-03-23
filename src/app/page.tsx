"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

type Community = {
  id: number;
  title: string;
  description: string;
  category: string;
  members: string;
  price: string;
  image: string;
  creatorAvatar: string;
};

// Base 40 communities
const baseCommunities = [
  { id: 1, title: "Insights Hub", description: "La comunidad más grande para analistas en Latam.", category: "Tecnología", members: "8k", price: "Gratis" },
  { id: 2, title: "Solo Founder's Club", description: "Bootstrapping de 0 a 1. Masterminds semanales.", category: "Negocios", members: "2.1k", price: "$15/mo" },
  { id: 3, title: "Visual Explorers", description: "Un espacio para artistas 3D y creadores experimentales.", category: "Diseño", members: "5.4k", price: "Gratis" },
  { id: 4, title: "The Backend Guild", description: "Arquitectura de sistemas escalables y alta performance.", category: "Tecnología", members: "1.8k", price: "$49/mo" },
  { id: 5, title: "Marketing para Devs", description: "Aprende a vender tus proyectos de software y conseguir usuarios iniciales.", category: "Marketing", members: "4.2k", price: "Gratis" },
  { id: 6, title: "IA Creativa LATAM", description: "Domina Midjourney, Stable Diffusion y ChatGPT.", category: "Inteligencia Artificial", members: "12k", price: "$9/mo" },
  { id: 7, title: "Finanzas Freelance", description: "Masterclass y comunidad para ordenar tus ingresos.", category: "Negocios", members: "3.5k", price: "$29/mo" },
  { id: 8, title: "No-Code Makers", description: "Crea aplicaciones sin escribir código con Bubble y Make.", category: "Tecnología", members: "6.7k", price: "Gratis" },
  { id: 9, title: "Copywriting Masters", description: "Textos que venden. Ejercicios diarios y feedback cruzado.", category: "Marketing", members: "1.2k", price: "$19/mo" },
  { id: 10, title: "UX Writers LATAM", description: "Diseñando experiencias a través de las palabras.", category: "Diseño", members: "3.1k", price: "Gratis" },
  { id: 11, title: "SaaS Builders", description: "De idea a $10k MRR. Construyendo SaaS de forma transparente.", category: "Negocios", members: "2.4k", price: "$99/mo" },
  { id: 12, title: "Prompt Engineers", description: "Ingeniería de prompts avanzada para Claude y OpenAI.", category: "Inteligencia Artificial", members: "15k", price: "Gratis" },
  { id: 13, title: "Español para Nómadas", description: "Aprende español interactuando todos los días.", category: "Idiomas", members: "1.1k", price: "$5/mo" },
  { id: 14, title: "Salud y Productividad", description: "Optimiza tu energía, sueño y enfoque para rendir mejor.", category: "Salud", members: "4.8k", price: "Gratis" },
  { id: 15, title: "Artistas Digitales", description: "Procreate, Photoshop y dibujo digital avanzado.", category: "Arte", members: "7.2k", price: "$12/mo" },
  { id: 16, title: "Frontend Fanatics", description: "React, Vue, Svelte y todo lo nuevo web.", category: "Tecnología", members: "18k", price: "Gratis" },
  { id: 17, title: "Ventas B2B Elite", description: "Estrategias de prospección y cierre de ventas corporativas.", category: "Negocios", members: "1.5k", price: "$40/mo" },
  { id: 18, title: "Web Design Pro", description: "Crea sitios web premium que cobran $5k+.", category: "Diseño", members: "3.2k", price: "$29/mo" },
  { id: 19, title: "Agencias Digitales", description: "Escala tu agencia a 6 cifras, consigue clientes y delega.", category: "Negocios", members: "8.9k", price: "Gratis" },
  { id: 20, title: "Meta Ads Masters", description: "Campañas escalables, creativos que venden y ROAS alto.", category: "Marketing", members: "2.5k", price: "$10/mo" },
  { id: 21, title: "Club de la Inteligencia", description: "Noticias diarias, uso y recursos de la Inteligencia Artificial.", category: "Inteligencia Artificial", members: "25k", price: "Gratis" },
  { id: 22, title: "English for IT", description: "Mejora tu inglés técnico para trabajar en EEUU o Europa.", category: "Idiomas", members: "9.3k", price: "$15/mo" },
  { id: 23, title: "Biohacking Hispano", description: "Optimiza tu fisiología. Suplementos, rutinas y longevidad.", category: "Salud", members: "4.1k", price: "Gratis" },
  { id: 24, title: "Fotografía y Cine", description: "Aprende de cineastas e iluminadores a nivel profesional.", category: "Arte", members: "11k", price: "$25/mo" },
  { id: 25, title: "Python Devs", description: "Data, Web, Scripts. La comunidad amigable de Python.", category: "Tecnología", members: "30k", price: "Gratis" },
  { id: 26, title: "TikTok Creators", description: "Reels y TikToks virales. Guiones, ganchos y edición rápida.", category: "Marketing", members: "14k", price: "$9/mo" },
  { id: 27, title: "Ecommerce 360", description: "Dropshipping, Marcas Propias y Logística para E-com.", category: "Negocios", members: "6k", price: "$39/mo" },
  { id: 28, title: "Figma Community", description: "Recursos, plugins, y feedback constante de diseño de interfaz.", category: "Diseño", members: "22k", price: "Gratis" },
  { id: 29, title: "Robotics & IoT", description: "Hardware e internet de las cosas. Proyectos semanales.", category: "Tecnología", members: "3.3k", price: "$12/mo" },
  { id: 30, title: "SEO Especialistas", description: "Posicionamiento orgánico de élite. Linkbuilding real.", category: "Marketing", members: "8.5k", price: "Gratis" },
  { id: 31, title: "Lógica y Algoritmos", description: "Preparación pura para entrevistas técnicas (FAANG/MAANG).", category: "Tecnología", members: "15k", price: "$49/mo" },
  { id: 32, title: "Club de Inversores", description: "Análisis financiero, acciones, bolsa y macroeconomía.", category: "Negocios", members: "55k", price: "Gratis" },
  { id: 33, title: "Product Managers", description: "Arte y ciencia de construir productos que la gente ama.", category: "Negocios", members: "9k", price: "$29/mo" },
  { id: 34, title: "Motion Graphics", description: "Animación en After Effects y modelado ligero en Cinema4D.", category: "Diseño", members: "4.7k", price: "$15/mo" },
  { id: 35, title: "Escritura Creativa", description: "Talleres literarios para novelas, cuentos y guiones.", category: "Arte", members: "6.3k", price: "Gratis" },
  { id: 36, title: "Fullstack React", description: "Next.js, Tailwind, TypeScript, Supabase y tRPC.", category: "Tecnología", members: "42k", price: "Gratis" },
  { id: 37, title: "Mentes Maestras", description: "Mastermind exclusivo de CEO's y fundadores tech (ingreso rígido).", category: "Negocios", members: "500", price: "$200/mo" },
  { id: 38, title: "Nutrición Basada en Evidencia", description: "Dile adiós a los mitos fitness. Todo con papers.", category: "Salud", members: "16k", price: "Gratis" },
  { id: 40, title: "Cybersecurity Net", description: "Hackeo ético, blue teaming y caza de exploits.", category: "Tecnología", members: "11k", price: "$30/mo" }
];

const gifPallette = [
  "https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif",
  "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
  "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif", 
  "https://media.giphy.com/media/3oKIPEqDGUULpEU0aQ/giphy.gif",
  "https://media.giphy.com/media/QvBoMEcQ7DQXK/giphy.gif", 
  "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif", 
  "https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
  "https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif",
  "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
  "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
  "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif",
  "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "https://media.giphy.com/media/3KVSB0dZyffZNKraXB/giphy.gif",
  "https://media.giphy.com/media/3oEduV4SOS9mmmIOkw/giphy.gif"
];

const mappedBaseCommunities = baseCommunities.map((c, index) => ({
  ...c,
  // Distribuir GIFs al 50% de las tarjetas para máximo dinamismo
  image: index % 2 === 0 
           ? gifPallette[(index / 2) % gifPallette.length] 
           : `https://picsum.photos/id/${c.id + 10}/400/250`, 
  creatorAvatar: `https://i.pravatar.cc/150?u=${c.id}` 
}));

// Generar ~120 Mocks
const mockCommunities: Community[] = [
  ...mappedBaseCommunities,
  ...mappedBaseCommunities.map(c => ({ ...c, id: c.id + 40, image: `https://picsum.photos/id/${c.id + 50}/400/250`, creatorAvatar: `https://i.pravatar.cc/150?u=${c.id + 40}` })),
  ...mappedBaseCommunities.map(c => ({ ...c, id: c.id + 80, image: `https://picsum.photos/id/${c.id + 90}/400/250`, creatorAvatar: `https://i.pravatar.cc/150?u=${c.id + 80}` }))
];

export default function DiscoverPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [visibleCount, setVisibleCount] = useState(12);

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

  const categories = [
    "Todas", "Diseño", "Tecnología", "Negocios", "Marketing", "Inteligencia Artificial", "Idiomas", "Salud", "Arte", "Desarrollo Creativo", "Ventas B2B", "Trading", "Criptomonedas", "No-Code", "Gastronomía", "Música"
  ];

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

        {activeCategory === "Todas" && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
            <Link href="/c/design-systems-latam" className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-lowest h-[400px] block cursor-pointer">
              <img
                alt="Featured Community"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute top-4 right-4">
                <div className="w-14 h-14 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl bg-surface-container-highest">
                   <img src="https://i.pravatar.cc/150?u=featured1" alt="Creator" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 p-8 text-on-primary">
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest rounded-full text-white shadow-lg">
                    Elección del Editor
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-2 text-white">
                  Design Systems Latam
                </h2>
                <p className="text-white/80 max-w-md text-sm mb-6 leading-relaxed hidden sm:block">
                  Aprende a construir tokens, componentes escalables y variables
                  en Figma. Casos de estudio interactivos.
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
                    <span className="font-bold text-sm text-white">12k Miembros</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="md:col-span-4 bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between border border-outline-variant/20 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/10">
                   <span className="material-symbols-outlined text-primary text-2xl animate-pulse">local_fire_department</span>
                   <h3 className="text-lg font-extrabold text-on-surface uppercase tracking-tight">Tendencias Rápidas</h3>
                </div>
                
                <div className="space-y-1 overflow-y-auto pr-2 flex-1 max-h-[260px] custom-scrollbar">
                  {[
                    { title: "React Native Masters", mems: "5.4k", rise: "+120 hoy" },
                    { title: "Creadores Notion", mems: "14k", rise: "+89 hoy" },
                    { title: "SaaS Builders Elite", mems: "1.2k", rise: "+45 hoy" },
                    { title: "E-commerce Pro", mems: "800", rise: "+42 hoy" },
                    { title: "UI Design Hackers", mems: "4.5k", rise: "+30 hoy" },
                    { title: "Escritura Persuasiva", mems: "12k", rise: "+25 hoy" },
                    { title: "Startups Latam Ai", mems: "3k", rise: "+18 hoy" },
                    { title: "Inglés para Devs", mems: "22k", rise: "+15 hoy" },
                    { title: "Finanzas Personales", mems: "18k", rise: "+12 hoy" },
                    { title: "Agencias Digitales 360", mems: "9.1k", rise: "+10 hoy" },
                  ].map((trend, i) => (
                    <div
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
                             {trend.mems} miembros
                           </span>
                           <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-1.5 rounded-md">
                             {trend.rise}
                           </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant/30 group-hover:text-primary/70 text-[18px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 mt-2 border-t border-outline-variant/10">
                   <button className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-dark text-xs font-bold rounded-xl transition-colors tracking-wide flex justify-center items-center gap-2">
                     Explorar Ranking Completo
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
                           router.push(`/creator/Creador-${community.id}`);
                        }}
                    >
                       <div className={`w-12 h-12 rounded-full border-[3px] bg-surface-container-high overflow-hidden shadow-sm ${community.id % 2 === 0 ? 'border-zinc-900' : 'border-surface-container-lowest'}`}>
                         <img src={community.creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                       </div>
                       {community.id % 2 === 0 && (
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
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
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

          {filteredCommunities.length === 0 && (
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
