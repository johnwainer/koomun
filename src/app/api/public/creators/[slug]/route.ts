import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    // Check if the slug is a pure UUID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

    let query = supabaseClient
      .from('profiles')
      .select('id, full_name, username, plan, role, bio, avatar_url, cover_url');

    if (isUUID) {
       query = query.eq('id', slug);
    } else {
       // Support legacy URL like "Creador-UUID" and extract just the UUID
       const idMatch = slug.match(/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/);
       if (idMatch) {
          query = query.eq('id', idMatch[1]);
       } else {
          query = query.eq('username', slug);
       }
    }

    const { data: profile, error: profileErr } = await query.single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // 2. Get Communities
    const { data: communities } = await supabaseClient
      .from('communities')
      .select('id, title, description, cover_image_url, price_tier, category:categories(name), members:members(count)')
      .eq('creator_id', profile.id)
      .eq('is_published', true);

    const cIds = communities?.map(c => c.id) || [];
    let eventsData: any[] = [];
    if (cIds.length > 0) {
      const { data: eventsRes } = await supabaseAdmin
        .from('events')
        .select('id, title, description, type, event_date, event_time, location_or_link, community:communities(title)')
        .in('community_id', cIds)
        .order('created_at', { ascending: false })
        .limit(10);
      eventsData = eventsRes || [];
    }

    return NextResponse.json({ 
      creator: profile,
      communities: communities || [],
      events: eventsData
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
