import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: communities, error } = await supabaseClient
      .from('communities')
      .select(`
        id,
        title,
        description,
        price_tier,
        cover_image_url,
        is_published,
        creator:profiles(id, full_name, username, avatar_url, plan),
        category:categories(name),
        members:members(count)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ communities }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
