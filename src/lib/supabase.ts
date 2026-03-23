import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "placeholder";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

// Client para consumo público / Frontend React
// Expone las políticas RLS y la sesión actual del usuario.
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin Client (Service Role)
// ATENCIÓN: Solo debe importarse en rutas de servidor (/api) 
// Se salta las RLS y tiene superpoderes sobre toda la DB.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
