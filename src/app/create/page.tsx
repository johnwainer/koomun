"use client";

import { useState } from "react";
import Link from "next/link";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

export default function CreateCommunityPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "Negocios",
    pricing: "free",
    price: "",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-6 min-h-screen bg-surface flex flex-col items-center">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <header className="mb-10 text-center w-full">
            <div className="flex items-center justify-center gap-2 mb-4">
               <span className="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
              Lanza tu Comunidad
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Crea tu espacio, establece tus reglas y comienza a construir tu audiencia. Gratis y sin código.
            </p>
          </header>

          <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 lg:p-12 shadow-xl relative overflow-hidden">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className={`h-full bg-primary transition-all duration-500 ${step >= s ? 'w-full' : 'w-0'}`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Step 1: Info */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold text-on-surface mb-6">Información Básica</h2>
                
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Nombre de la Comunidad <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Ej. Hackers Latinoamericanos"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-surface-container-high border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">URL Personalizada <span className="text-red-500">*</span></label>
                    <div className="flex bg-surface-container-high border-2 border-outline-variant/20 focus-within:border-primary rounded-xl overflow-hidden transition-colors">
                      <span className="px-4 py-3 text-on-surface-variant font-medium bg-surface border-r border-outline-variant/20 select-none flex-shrink-0">koomun.com/c/</span>
                      <input 
                        type="text" 
                        name="slug"
                        placeholder="ej-tu-comunidad"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                        className="w-full px-4 py-3 bg-transparent text-on-surface outline-none font-bold"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2 font-medium">Esta será la dirección pública del landing page oficial de tu ecosistema.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Descripción Corta</label>
                    <textarea 
                      name="description"
                      rows={3}
                      placeholder="¿De qué trata este imperio que estás construyendo?"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full bg-surface-container-high border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Categoría</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-surface-container-high border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option>Negocios</option>
                      <option>Tecnología y Programación</option>
                      <option>Cripto y Web3</option>
                      <option>Arte y Diseño Visual</option>
                      <option>Marketing y Crecimiento</option>
                      <option>Salud y Fitness</option>
                      <option>Desarrollo Personal</option>
                      <option>Finanzas e Inversiones</option>
                      <option>Música y Audio</option>
                      <option>Fotografía y Video</option>
                      <option>Deportes y E-Sports</option>
                      <option>Derecho y Leyes</option>
                      <option>Gastronomía</option>
                      <option>Idiomas</option>
                      <option>Viajes y Estilo de Vida</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Branding */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold text-on-surface mb-6">Identidad Visual</h2>
                
                <div className="flex flex-col gap-8">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Sube una Portada (Opcional)</label>
                    <div className="w-full h-40 border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high/50 hover:border-primary transition-all cursor-pointer group">
                       <span className="material-symbols-outlined text-4xl mb-2 group-hover:text-primary transition-colors">cloud_upload</span>
                       <span className="text-sm font-medium">Arrastra una imagen o haz clic para subir</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Icono o Logotipo</label>
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-outline-variant/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-outline-variant">add_photo_alternate</span>
                       </div>
                       <button className="px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-bold hover:bg-surface-container-high transition-colors text-on-surface">Subir Icono</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Monetization */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold text-on-surface mb-6">Modelo de Acceso</h2>
                
                <div className="flex flex-col gap-6">
                  <div 
                    onClick={() => setFormData({...formData, pricing: 'free'})}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${formData.pricing === 'free' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}
                  >
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                           <span className={`material-symbols-outlined ${formData.pricing === 'free' ? 'text-primary' : 'text-outline-variant'}`}>public</span>
                           <h3 className="font-bold text-on-surface text-lg">Acceso Gratuito</h3>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.pricing === 'free' ? 'border-primary' : 'border-outline-variant/50'}`}>
                           {formData.pricing === 'free' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                     </div>
                     <p className="text-sm text-on-surface-variant ml-9">Cualquier usuario de la plataforma podrá unirse inmediatamente sin fricción. Ideal para crecer tu audiencia rápido.</p>
                  </div>

                  <div 
                    onClick={() => setFormData({...formData, pricing: 'paid'})}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${formData.pricing === 'paid' ? 'border-amber-500 bg-amber-500/5' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}
                  >
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                           <span className={`material-symbols-outlined ${formData.pricing === 'paid' ? 'text-amber-500' : 'text-outline-variant'}`}>payments</span>
                           <h3 className="font-bold text-on-surface text-lg">Membresía Pagada</h3>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.pricing === 'paid' ? 'border-amber-500' : 'border-outline-variant/50'}`}>
                           {formData.pricing === 'paid' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                        </div>
                     </div>
                     <p className="text-sm text-on-surface-variant ml-9 mb-4">Solo usuarios que paguen tu suscripción podrán acceder al contenido y chat de esta comunidad.</p>
                     
                     {formData.pricing === 'paid' && (
                       <div className="ml-9 animate-in slide-in-from-top-2">
                         <label className="block text-xs font-bold text-on-surface mb-2 uppercase tracking-widest">Precio Mensual (USD)</label>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">$</span>
                            <input 
                              type="number" 
                              name="price"
                              placeholder="Ej. 19.99"
                              value={formData.price}
                              onChange={handleChange}
                              className="w-full max-w-[200px] bg-surface-container-lowest border-2 border-outline-variant/20 focus:border-amber-500 rounded-xl pl-8 py-2 text-on-surface outline-none transition-colors"
                            />
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-outline-variant/10">
              {step > 1 ? (
                 <button onClick={prevStep} className="px-6 py-3 font-bold text-on-surface-variant hover:text-on-surface transition-colors">Atrás</button>
              ) : <div></div>}
              
              {step < 3 ? (
                 <button 
                  onClick={nextStep}
                  disabled={step === 1 && (!formData.name || !formData.slug)}
                  className="px-8 py-3 bg-primary text-white font-extrabold rounded-full hover:bg-primary-container shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                 >
                   Continuar
                 </button>
              ) : (
                 <Link href="/studio">
                   <button className="px-8 py-3 bg-on-surface text-surface font-extrabold rounded-full hover:opacity-90 shadow-xl active:scale-95 transition-all text-sm flex items-center gap-2">
                     Crear Imperio
                     <span className="material-symbols-outlined text-sm">rocket_launch</span>
                   </button>
                 </Link>
              )}
            </div>
            
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
