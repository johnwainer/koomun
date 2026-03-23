import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    // PROTECCIÓN ESTRICTA: Solo las peticiones con Header Admin-Token válido o Supabase Auth JWT de Admin podrían entrar.
    // Ej: const authHeader = req.headers.get('Authorization'); -> Validar token.
    // Para propositos demostrativos, este endpoint actúa como el microservicio de gestión interna.

    // supabaseAdmin salta las reglas RLS, garantizando acceso a la BD completa.
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ total: users.length, users }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Ej: Para crear o purgar un usuario como administrador sin pasar por su UI
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, message: "Funcionalidad admin en construccion", body }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
