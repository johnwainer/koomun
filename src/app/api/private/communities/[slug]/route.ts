import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

    // Auth Validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const session = { user };

    let query = supabaseClient
      .from('communities')
      .select('id, title, description, cover_image_url, is_private, price_tier, creator_id, creator:profiles(full_name, avatar_url, plan)');

    if (isUUID) {
       query = query.eq('id', slug);
    } else {
       query = query.ilike('title', slug.replace(/-/g, '%'));
    }

    const { data: community, error } = await query.single();

    if (error) throw error;
    
    // Check if the user is a member or the creator
    let isMember = false;
    if (community.creator_id === session.user.id) {
       isMember = true;
    } else {
       const { data: memberCheck } = await supabaseClient
          .from('members')
          .select('id')
          .eq('community_id', community.id)
          .eq('user_id', session.user.id)
          .maybeSingle();

       if (memberCheck) {
          isMember = true;
       }
    }

    // Traer próximos eventos (solo si es miembro)
    let events: any[] = [];
    if (isMember) {
      const { data } = await supabaseClient
        .from('events')
        .select('id, title, event_date, event_time, description, type')
        .eq('community_id', community.id)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(3);
      events = data || [];
    }

    return NextResponse.json({ community, events, isMember }, { status: 200 });

  } catch (error: any) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    let query = supabaseClient.from('communities').select('id, price_tier');
    if (isUUID) {
       query = query.eq('id', slug);
    } else {
       query = query.ilike('title', slug.replace(/-/g, '%'));
    }

    const { data: community, error } = await query.single();
    if (error) throw error;

    // Check if already member
    const { data: memberCheck } = await supabaseClient
       .from('members')
       .select('id')
       .eq('community_id', community.id)
       .eq('user_id', user.id)
       .maybeSingle();

    if (memberCheck) {
       return NextResponse.json({ success: true, message: 'Ya eres miembro' }, { status: 200 });
    }

    // Insert new member
    const { error: insertError } = await supabaseClient
       .from('members')
       .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'member'
       });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, id: community.id }, { status: 200 });
  } catch(error: any) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
