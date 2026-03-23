import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
    }

    // Usamos el cliente estándar (Public) para iniciar sesión
    const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      return NextResponse.json({ error: authError?.message || 'Login failed' }, { status: 401 });
    }

    // Buscamos el rol real del usuario en la tabla Profiles
    const { data: profile, error: dbError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message, context: "Profile Fetch failed" }, { status: 401 });
    }

    // Devuelve los tokens para que Web/Apps móviles la guarden (ej. SecureStore en iOS/Android)
    return NextResponse.json({ 
      user: data.user, 
      session: data.session,
      role: profile?.role || 'user',
      message: 'Login Exitoso' 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
