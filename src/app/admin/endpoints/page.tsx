"use client";
import { supabaseClient } from "@/lib/supabase";

export default function AdminEndpointsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/auth/login",
      description: "Verifica credenciales y retorna un JWT session válido.",
      body: "{ email, password }"
    },
    {
      method: "POST",
      path: "/api/auth/register",
      description: "Registra a un usuario inyectándole el full_name en su metadata y trigger en profiles.",
      body: "{ email, password, full_name }"
    },
    {
      method: "GET",
      path: "/api/admin/users",
      description: "Retorna todos los perfiles registrados ignorando RLS (Service Role).",
      body: "N/A"
    },
    {
      method: "PUT",
      path: "/api/admin/users/role",
      description: "Promueve o degrada a un usuario a super_admin, creator o user.",
      body: "{ userId, newRole }"
    },
    {
      method: "GET",
      path: "/api/admin/communities",
      description: "Retorna todas las comunidades e incluye joins a perfiles creadores con avatar.",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/private/me",
      description: "Retorna los datos de sesión y perfil del usuario autenticado.",
      body: "N/A"
    },
    {
      method: "POST",
      path: "/api/private/me",
      description: "Upsert (actualiza o inserta) información general del perfil del usuario (nombre, biografía, etc).",
      body: "{ full_name, bio, avatar_url }"
    },
    {
      method: "PUT",
      path: "/api/private/security",
      description: "Actualiza la contraseña global del usuario autenticado utilizando bypass admin auth.",
      body: "{ password }"
    },
    {
      method: "DELETE",
      path: "/api/private/security",
      description: "Elimina permanentemente al usuario del sistema (Auth y DB en cascada).",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/private/chat",
      description: "Devuelve los mensajes directos o chats del usuario en sesión.",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/private/notifications",
      description: "Retorna la lista de notificaciones recientes no leídas/leídas del usuario.",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/private/my-communities",
      description: "Devuelve el resumen de las comunidades a las que pertenece el usuario autenticado.",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/private/feed",
      description: "Devuelve el contenido y posts del feed del usuario de forma paginada.",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/public/events",
      description: "Retorna todos los eventos públicos del calendario evadiendo reglas de fila (RLS) para display abierto.",
      body: "N/A"
    },
    {
      method: "POST",
      path: "/api/private/feed",
      description: "Crea una nueva publicación (post) en el feed de una comunidad para el usuario autenticado.",
      body: "{ communityId, content }"
    },
    {
      method: "POST",
      path: "/api/private/feed/[postId]/like",
      description: "Incrementa el contador de likes en una publicación del feed de manera optimista.",
      body: "N/A"
    },
    {
      method: "DELETE",
      path: "/api/private/communities/[slug]/leave",
      description: "Permite al usuario abandonar una comunidad, borrando toda su participación e historial (GDPR compl.).",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/creators",
      description: "Retorna el listado público de creadores con su influencia global calculada (Miembros Totales).",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/communities",
      description: "Retorna el listado global y público de comunidades.",
      body: "N/A"
    },
    {
      method: "GET",
      path: "/api/private/library",
      description: "Obtiene los recursos y assets de valor de las comunidades en las que participa el usuario.",
      body: "N/A"
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <header className="flex flex-col items-start gap-4 mb-4">
        <h1 className="text-3xl font-black text-on-surface tracking-tighter">
          Microservicios API
        </h1>
        <p className="text-sm font-medium text-on-surface-variant max-w-2xl">
          Lista de endpoints RESTfully habilitados en Next.js. Listos para ser consumidos globalmente por el Frontend, Bots, Swift o Kotlin inyectando cookies nativas o tokens portadores.
        </p>
      </header>

      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-surface-container-lowest font-medium">
            <thead className="bg-[#faf9f7] text-xs uppercase tracking-widest text-on-surface-variant font-black">
              <tr>
                <th className="p-4 border-b border-outline-variant/10 py-5 w-24">Method</th>
                <th className="p-4 border-b border-outline-variant/10">Endpoint Path</th>
                <th className="p-4 border-b border-outline-variant/10">Descripción Técnica</th>
                <th className="p-4 border-b border-outline-variant/10">Payload Requerido</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, i) => (
                <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors text-sm">
                  <td className="p-4 font-black">
                     <span className={`px-2 py-1 text-[10px] rounded-sm ${ep.method === 'POST' ? 'bg-amber-500/10 text-amber-600' : ep.method === 'PUT' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
                       {ep.method}
                     </span>
                  </td>
                  <td className="p-4">
                     <span className="font-mono text-primary font-bold">{ep.path}</span>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant max-w-sm">
                     {ep.description}
                  </td>
                  <td className="p-4 text-xs">
                     <span className="font-mono bg-surface-container px-2 py-1 rounded text-outline-variant">
                       {ep.body}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
