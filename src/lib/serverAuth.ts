import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: NextResponse.json({ error: "No autorizado. Token requerido." }, { status: 401 }) };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  
  if (authError || !user) {
    return { error: NextResponse.json({ error: "Token inválido" }, { status: 401 }) };
  }

  // Verifica el rol (puede estar en el metadata guardado al setear via el endpoint /api/admin/users/role)
  // O en la base de datos `profiles`. Por seguridad, leer de DB local.
  const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
  
  if (!profile || profile.role !== 'super_admin') {
    return { error: NextResponse.json({ error: "Prohibido. Se requieren privilegios de Super Admin." }, { status: 403 }) };
  }
  
  return { user };
}
