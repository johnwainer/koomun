import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     
     if (authError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const userId = session.user.id;

     // Get profile
     const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

     if (error) {
       // if not found, we could potentially create one or just return the user session data
       if (error.code === 'PGRST116') {
          return NextResponse.json({ user: session.user, profile: { role: 'user', first_name: '', last_name: '', biography: '' } }, { status: 200 });
       }
       throw error;
     }

     return NextResponse.json({ user: session.user, profile }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     
     if (authError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const userId = session.user.id;
     const body = await req.json();
     
     // Upsert profile
     const { error } = await supabaseClient
        .from('profiles')
        .upsert({ 
           id: userId,
           first_name: body.first_name,
           last_name: body.last_name,
           biography: body.biography,
           avatar_url: body.avatar_url,
           website: body.website,
           updated_at: new Date().toISOString()
        });

     if (error) throw error;

     return NextResponse.json({ success: true }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
