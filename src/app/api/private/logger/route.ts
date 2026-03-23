import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
     const authHeader = req.headers.get('Authorization');
     if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     
     const token = authHeader.replace('Bearer ', '');
     const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
     if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     const { action, entity_type, entity_id, metadata } = await req.json();

     if (!action) return NextResponse.json({ error: 'Action is required' }, { status: 400 });

     await supabaseAdmin.from('audit_logs').insert({
        actor_id: user.id,
        action,
        entity_type: entity_type || 'system',
        entity_id: entity_id || user.id,
        metadata: metadata || {}
     });

     return NextResponse.json({ success: true }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
