import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     
     if (authError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const userId = session.user.id;

     const { data: notifs, error } = await supabaseClient
        .from('notifications')
        .select(`id, type, target_id, title, content, is_read, created_at`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

     if (error) throw error;

     return NextResponse.json({ success: true, notifications: notifs || [] }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
