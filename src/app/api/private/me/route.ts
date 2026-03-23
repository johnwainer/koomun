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

     // Get profile
     const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

     if (error) {
       // if not found, we could potentially create one or just return the user session data
       if (error.code === 'PGRST116') {
          return NextResponse.json({ user: session.user, profile: { role: 'user', full_name: '', bio: '' } }, { status: 200 });
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
     const body = await req.json();
     
     // Upsert profile
     const { error } = await supabaseClient
        .from('profiles')
        .update({ 
           full_name: body.full_name,
           bio: body.bio,
           avatar_url: body.avatar_url,
           updated_at: new Date().toISOString()
        })
        .eq('id', userId);

     if (error) throw error;

     return NextResponse.json({ success: true }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
