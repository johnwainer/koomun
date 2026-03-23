"use client";

import { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

export default function SupportPage() {
  const [search, setSearch] = useState("");

  const faqs = [
    {
      q: "¿Cómo configuro las notificaciones de nuevos posts?",
      a: "Puedes ir a tus Ajustes > Notificaciones y seleccionar si deseas correos, push en el navegador o un resumen diario de tus comunidades activas."
    },
    {
      q: "¿Cómo migro mi comunidad desde Skool o Facebook Groups?",
      a: "Tenemos una herramienta de importación gratuita que extrae tus miembros y publicaciones principales vía CSV. Contáctanos por mensaje directo para habilitártela en tu panel de creador."
    },
    {
      q: "¿Cómo cancelo mi suscripción Pro?",
      a: "Ve a Ajustes > Facturación. Ahí verás una tarjeta enlazada a tu suscripción activa. Puedes presionar 'Cancelar' y conservarás beneficios hasta el fin de ciclo."
    },
    {
      q: "¿Cómo funcionan las comisiones por cobrar suscripciones?",
      a: "Utilizamos Stripe Connect. Solo cobramos el 2.9% + 30¢ estándar de la industria por transacción; Koomun no se queda con ningún porcentaje oculto de tus ganancias."
    },
    {
      q: "¿Cómo accedo a las aulas si estoy en un plan gratuito?",
      a: "El plan esencial solo cubre las comunidades de discusión. Para ver videos, descargar recursos incrustados o asistir a Q&A necesitarás Mejorar tu Plan."
    },
    {
      q: "¿Puedo tener múltiples administradores en mi comunidad?",
      a: "Sí, puedes asignar roles de Administrador o Moderador ilimitadamente desde el módulo Configuración de la Comunidad > Miembros."
    },
    {
      q: "¿Qué países están disponibles para cobrar suscripciones?",
      a: "Koomun usa Stripe Connect. Esto significa que puedes cobrar si tienes cuenta bancaria en más de 40 países soportados (incluyendo México, España, y Brasil). Consulta la documentación de Stripe para detalles por país."
    },
    {
      q: "¿Qué porcentaje se queda Koomun de mis ventas?",
      a: "¡Cero! A diferencia de plataformas como Hotmart o Patreon, en Koomun tú te quedas con el 100% de tus membresías u ofertas (exceptuando las comisiones estándar de procesamiento que cobra Stripe)."
    },
    {
      q: "¿Puedo cobrar membresías mensuales y planes vitalicios a la vez?",
      a: "Totalmente. Puedes configurar múltiples niveles de precio, desde suscripciones recurrentes (mensual, anual) hasta cobros de 'pago único' para accesos de por vida o aceleradores."
    },
    {
      q: "¿Cómo retiro mi dinero ganado (Payouts)?",
      a: "Stripe realiza los depósitos directamente a la cuenta bancaria enlazada a tu perfil de creador en días hábiles. Puedes modificar la frecuencia (Diario, Semanal, Mensual) desde tu Dashboard."
    },
    {
      q: "¿Dónde hospedo los videos de mis cursos de las Aulas?",
      a: "Recomendamos que hospedes tus archivos de video pesados en plataformas como YouTube, Vimeo o Wistia, y luego pegues el enlace de incrustación (Embed Link) dentro de Koomun. Funciona en segundos."
    },
    {
      q: "¿Puedo configurar un dominio personalizado?",
      a: "Sí. En el Plan Pro puedes vincular tu propio dominio o subdominio (ej: aprende.tu-marca.com) desde la configuración general, inyectando los regitros CNAME en tu proveedor de dominio."
    },
    {
      q: "¿Cómo mido mi progreso en los cursos?",
      a: "En la barra lateral de las Aulas tendrás una barra de progreso que se autocompleta con un porcentaje dinámico a medida que marcas 'Completado' frente a cada lección de video."
    },
    {
      q: "¿Puedo exportar el listado de correos de mis miembros?",
      a: "¡Son tus usuarios! Puedes extraer la lista completa desde la configuración de comunidad (Miembros > Exportar a CSV) y llevarte la data a ActiveCampaign, MailChimp o cualquier otro CRM."
    },
    {
      q: "¿Cómo controlo lo que dicen los miembros? ¿Existe un sistema de moderación?",
      a: "Sí. Tus Administradores tendrán un botón nativo en cualquier post o comentario irregular que diga 'Eliminar publicación'. Pronto permitiremos alertas y baneos temporales por algoritmo interno."
    },
    {
      q: "¿Koomun cuenta con una App Móvil Nativa?",
      a: "Koomun está desarrollado como una 'Progressive Web App' (PWA) ultramoderna. Esto significa que tus miembros pueden 'Agregar a Pantalla de Inicio' nuestra web, y funcionará al 100% como app nativa, con notificaciones Push y rendimiento de App Store."
    },
    {
      q: "¿Qué sucede si no apruebo a alguien que pagó acceso a mi comunidad cerrada?",
      a: "Al usar precios automatizados en Koomun, todo miembro que pague tu enlace de compra es admitido automáticamente y se genera su cuenta en milisegundos. Para comunidades con 'Solicitud de Ingreso', no configuramos cobros sin aprobación previa."
    },
    {
      q: "¿Existen límites en la cantidad de miembros en mi grupo?",
      a: "¡No te castigamos por tu éxito! Puedes tener desde cien miembros hasta más de quinientos mil en un solo grupo sin pagar un centavo extra. Nuestro plan cuesta lo mismo sin importar tráfico."
    },
    {
      q: "¿Por qué Koomun usa USD como moneda estándar de precios?",
      a: "Para la estructura B2B SaaS, preferimos tener precios fijos universales y que la pasarela de pagos convierta la moneda a su equivalente local; esto evita la inflación extrema y la fluctuación."
    },
    {
      q: "¿Cómo funcionan los Puntos (Leaderboard) y Rangos (Levels)?",
      a: "Los miembros obtienen 1 Punto por cada 'Me gusta' que reciben en sus publicaciones y comentarios directos. Al acumular ciertos puntos, desbloquean 'Niveles' automatizados estimulando el buen comportamiento (Gamification)."
    },
    {
      q: "¿Puedo hacer que mis Cursos se abran solo en ciertos Niveles?",
      a: "¡Esa es la idea del Leaderboard! Puedes bloquear y configurar todo un módulo de aulas para que se desbloquee mágicamente solo cuando un usuario alcance un nivel en el Leaderboard (ej. Alcanzar Nivel 5)."
    },
    {
      q: "¿Koomun está alojado en Latam u otras partes?",
      a: "Koomun está desplegado en redes globales edge (Vercel) para que la página cargue en milisegundos desde cualquier parte del mundo. Nuestra base de datos relacional (Supabase) corre rápida y segura."
    },
    {
      q: "¿Qué pasa si mis cobros son rechazados repetitivamente?",
      a: "Koomun envía 3 notificaciones progresivas recordando que la tarjeta ha fallado (estrategia de dunning). Si al cabo del tercer intento sigue sin fondo, el miembro se bloquea temporalmente de tus aulas premium."
    },
    {
      q: "¿Qué sucede si un líder de comunidad (el dueño) desaparece?",
      a: "Si detectamos que una comunidad premium interactiva lleva abandonada severamente por su dueño con cobros subyacentes activos, el sistema suspenderá la recaudación (Freeze Status)."
    },
    {
      q: "¿Puedo personalizar el color y el diseño interno de mis lecciones?",
      a: "Por la neuropsicología de la UX, Koomun rige un diseño minimalista de bloques oscuros monocromáticos que prioriza la retención. Puedes poner Cover Images en colores, pero nosotros nos encargamos matemáticamente del diseño visual."
    },
    {
      q: "¿Existen roles VIP con foros privados?",
      a: "Puedes asignar a un usuario roles especiales por medio de 'Categorías' de acceso exclusivo donde el contenido publicado ahí es invisible para los miembros de nivel inferior o gratuitos."
    },
    {
      q: "¿Hay integraciones con Zapier o Make?",
      a: "Estamos desplegando un link directo de webhooks entrantes, lo cual significa que pronto podrás insertar eventos externos (Typeform, MailChimp) y disparar acciones cruzadas de forma profesional."
    },
    {
      q: "¿Se pueden agendar eventos de Zoom o Google Meet dentro del Calendario?",
      a: "Sí. Al crear un nuevo Evento, pega tu link en el campo de ubicación. Tu red se enterará en su feed y podrán poner un recordatorio inteligente de asistencia en tiempo real."
    },
    {
      q: "¿Cuentan con soporte en español nativo?",
      a: "A diferencia de la competencia americana, todo el equipo detrás de Koomun habla y escribe en español local, asegurando respuestas clarísimas. Tu mercado, tus reglas."
    },
    {
      q: "¿Quién rige los impuestos de las ventas que hago?",
      a: "De cara a Stripe, Koomun y el estado civil de tu país, el vendedor o 'Merchant of Record' eres únicamente tú, con todas las libertades y obligaciones corporativas. Nosotros te enviamos liquidaciones en monto bruto final."
    }
  ];

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-6 lg:px-10 max-w-7xl mx-auto min-h-screen bg-surface">
        <header className="mb-16 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-on-surface mb-6">
             ¿Cómo podemos ayudarte?
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant text-xl">search</span>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca guías, respuestas o soluciones..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface-container-highest border border-transparent focus:border-outline-variant/30 focus:bg-surface-container-lowest outline-none transition-all shadow-inner text-on-surface placeholder:text-outline text-base font-medium"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <article className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-primary/20">
                 <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Primeros Pasos</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Aprende a crear tu primera comunidad, configurar muros y agregar tus reglas iniciales.</p>
           </article>

           <article className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-green-500/20">
                 <span className="material-symbols-outlined text-green-600 text-2xl">payments</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Cobros y Stripe</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Guías sobre cómo sincronizar tu billetera bancaria, recibir payouts constantes y comisiones.</p>
           </article>

           <article className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-purple-500/20">
                 <span className="material-symbols-outlined text-purple-600 text-2xl">school</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Aulas y Cursos</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Cómo incrustar videos (Vimeo, YouTube, Wistia), adjuntar archivos y medir progresos.</p>
           </article>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-primary text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl shadow-primary/20 relative overflow-hidden">
             <div className="absolute -top-32 -right-32 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full pointer-events-none"></div>
             <div>
                <span className="material-symbols-outlined text-4xl mb-4">support_agent</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Habla con Soporte</h2>
                <p className="opacity-90 leading-relaxed max-w-md text-sm sm:text-base">
                  Si estás presenciando un bug crítico o necesitas asistencia inmediata con tus herramientas, nuestro equipo de ingenieros responderá en minutos.
                </p>
             </div>
             <button className="mt-8 bg-white text-primary px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest w-max active:scale-95 transition-transform shadow-sm">
               Crear Ticket Prioritario
             </button>
          </div>

          <div className="bg-surface-container-highest border border-outline-variant/20 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-outline-variant/40 transition-colors">
             <div>
                <span className="material-symbols-outlined text-4xl text-on-surface mb-4">forum</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-on-surface">Comunidad Koomun HQ</h2>
                <p className="text-on-surface-variant leading-relaxed max-w-md text-sm sm:text-base">
                  Únete a nuestro foro interno oficial donde miles de creadores hispanos discuten estrategias para escalar sus comunidades e ingresos pasivos.
                </p>
             </div>
             <button className="mt-8 bg-on-surface text-surface px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest w-max active:scale-95 transition-transform shadow-sm flex items-center gap-2">
               Ingresar <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
             </button>
          </div>
        </section>

        <section className="mb-16">
           <h3 className="text-xl sm:text-2xl font-extrabold border-b border-outline-variant/10 pb-4 mb-8 text-on-surface">
             Preguntas Frecuentes
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, idx) => (
                <article key={idx} className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/10 hover:shadow-sm transition-shadow">
                   <h4 className="font-bold text-on-surface mb-3 leading-snug text-base sm:text-lg">
                     {faq.q}
                   </h4>
                   <p className="text-on-surface-variant text-sm relative text-balance">
                     {faq.a}
                   </p>
                </article>
              ))}
           </div>
        </section>

        <section className="bg-[#faf9f7] border-2 border-outline-variant/10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full border border-green-500/30 flex items-center justify-center bg-green-50 shrink-0">
                <span className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></span>
             </div>
             <div>
               <p className="font-bold text-sm sm:text-base text-on-surface leading-tight">Sistemas Operando al 100%</p>
               <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Todos los servidores y bases de datos están estables.</p>
             </div>
           </div>
           <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors">
              Ver Status Page
           </button>
        </section>

      </main>
      <BottomNavBar />
    </>
  );
}
