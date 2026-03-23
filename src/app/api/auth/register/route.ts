import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, password, full_name, plan } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Inyectar plan en raw_user_meta_data si es necesario
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        }
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ 
      user: data.user, 
      session: data.session,
      message: 'Registro exitoso. Revisa tu correo o inicia sesión.' 
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
