import { createClient } from "@supabase/supabase-js";

// Client para consumo público / Frontend React
// Expone las políticas RLS y la sesión actual del usuario.
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Admin Client (Service Role)
// ATENCIÓN: Solo debe importarse en rutas de servidor (/api) 
// Se salta las RLS y tiene superpoderes sobre toda la DB.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "", 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
