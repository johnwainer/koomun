import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

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

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Se requiere userId' }, { status: 400 });
    }

    // Usando el Service Role (Admin) destruye la cuenta maestra de Autenticación
    // Esto disparará la regla ON DELETE CASCADE de PostgreSQL y purgará los registros en profiles, communities, comments, etc!
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAction({
      action: 'DELETE_USER',
      entityType: 'profiles',
      entityId: userId,
      metadata: { deleted_by: 'system_admin' }
    });

    return NextResponse.json({ success: true, message: "Usuario y sus relaciones destruidas globalmente" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
