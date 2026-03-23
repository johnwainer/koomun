import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    // Attempt to extract the UUID from the slug (e.g. "Creador-1" or "Full-Name-UUID")
    const idMatch = slug.match(/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/);
    let creatorId = idMatch ? idMatch[1] : slug;
    
    if (slug.startsWith('Creador-') && !idMatch) {
       // Support old integer mock slugs if they ever reach here, but realistically all our DB ids are UUID.
       creatorId = slug.split('-').pop() || slug;
    }

    if (!creatorId) {
       return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }

    // 1. Get Profile
    const { data: profile, error: profileErr } = await supabaseClient
      .from('profiles')
      .select('id, full_name, plan, role, bio, avatar_url')
      .eq('id', creatorId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // 2. Get Communities
    const { data: communities } = await supabaseClient
      .from('communities')
      .select('id, title, description, cover_image_url, price_tier, category:categories(name)')
      .eq('creator_id', creatorId)
      .eq('is_published', true);

    // 3. Get Events
    const { data: events } = await supabaseClient
      .from('events')
      .select('id, title, description, type, event_date, event_time, location_or_link')
      .eq('creator_id', creatorId)
      .eq('visibility', 'Público')
      .order('event_date', { ascending: true })
      .limit(10);

    return NextResponse.json({ 
      creator: profile,
      communities: communities || [],
      events: events || []
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
