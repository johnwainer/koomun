import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
     const authHeader = req.headers.get('Authorization');
     if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     
     }
     const token = authHeader.replace('Bearer ', '');
     const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
     if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     
     }
     const session = { user }; // shim for code that uses session.user

     const userId = session.user.id;

     const { data: notifs, error } = await supabaseClient
        .from('notifications')
        .select(`id, type, actor_id, action_text, target_text, is_read, created_at, actor:profiles!notifications_actor_id_fkey(first_name, last_name, avatar_url)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

     if (error) throw error;

     return NextResponse.json({ success: true, notifications: notifs || [] }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
