import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, community:communities(title), creator:profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ events: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Auto-Mock Handler
    if (body.mock) {
       const { data: communities } = await supabaseAdmin.from('communities').select('id, creator_id').limit(5);
       if (!communities || communities.length === 0) return NextResponse.json({ error: "No communities available" }, { status: 400 });

       const toInsert = communities.map((c, i) => ({
         community_id: c.id,
         creator_id: c.creator_id,
         title: `Evento de Prueba #${i+1}`,
         description: 'Este es un evento de prueba auto-generado',
         type: 'Virtual (Zoom)',
         event_date: '2026-05-10',
         event_time: '19:00',
         location_or_link: 'https://zoom.us',
         visibility: 'Público'
       }));

       const { data, error } = await supabaseAdmin.from('events').insert(toInsert).select();
       if (error) throw error;
       await logAction({ action: 'CREATE_MOCK', entityType: 'events', actorId: 'SuperAdmin', metadata: { count: toInsert.length } });
       return NextResponse.json({ success: true, events: data }, { status: 201 });
    }

    const { data, error } = await supabaseAdmin.from('events').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) throw error;
    
    await logAction({ action: 'DELETE', entityType: 'events', entityId: id, metadata: {} });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
