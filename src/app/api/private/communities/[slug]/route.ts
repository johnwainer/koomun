import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    // Attempt to extract the UUID from the slug (e.g. "Comunidad-1" or "Nombre-UUID")
    const idMatch = slug.match(/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/);
    const id = idMatch ? idMatch[0] : slug;
    
    // Auth Validation
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: community, error } = await supabaseClient
      .from('communities')
      .select('id, title, description, cover_image_url, is_private, price_tier, creator_id, creator:profiles(full_name, avatar_url, plan)')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Validate if the user is a member or the creator
    if (community.creator_id !== session.user.id) {
       const { data: memberCheck } = await supabaseClient
          .from('members')
          .select('id')
          .eq('community_id', community.id)
          .eq('user_id', session.user.id)
          .maybeSingle();

       if (!memberCheck) {
          return NextResponse.json({ error: "No tienes acceso a esta comunidad" }, { status: 403 });
       }
    }

    // Traer próximos eventos para esta comunidad
    const { data: events } = await supabaseClient
      .from('events')
      .select('id, title, event_date, event_time, description, type')
      .eq('community_id', community.id)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(3);

    return NextResponse.json({ community, events: events || [] }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
