import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     
     if (authError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const userId = session.user.id;

     // En un caso real: agrupar los direct_messages por usuario para crear los "chats activos"
     // Para efectos visuales y validación API, enviamos un estado de "Success sin data" 
     // o pasamos la lista vacia para que el frontend despliegue AccessMessage / vacío.
     
     const { data: messages, error } = await supabaseClient
        .from('direct_messages')
        .select(`
           id, content, created_at, is_read, sender_id, receiver_id
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

     if (error) throw error;

     return NextResponse.json({ success: true, messages: messages || [] }, { status: 200 });

  } catch (e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
