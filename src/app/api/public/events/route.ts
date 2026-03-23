import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: events, error } = await supabaseClient
      .from('events')
      .select('id, title, description, type, event_date, event_time, location_or_link, visibility, community_id, creator:profiles(full_name)')
      .order('event_date', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json({ events }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
