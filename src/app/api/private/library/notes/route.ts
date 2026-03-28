import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lessonId = url.searchParams.get('lessonId');
    
    // Auth Validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (!lessonId) return NextResponse.json({ error: "Lección no especificada" }, { status: 400 });

    const { data, error } = await supabaseClient
      .from('lesson_notes')
      .select('id, content, created_at, updated_at')
      .eq('lesson_id', lessonId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ notes: data || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const body = await req.json();
    const { lessonId, content } = body;
    
    if (!content || !content.trim()) return NextResponse.json({ error: "El apunte está vacío" }, { status: 400 });

    const { data, error } = await supabaseClient
      .from('lesson_notes')
      .insert({
         lesson_id: lessonId,
         user_id: user.id,
         content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
