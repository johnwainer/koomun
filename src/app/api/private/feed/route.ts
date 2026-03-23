import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const communityId = url.searchParams.get('communityId');
    
    // Auth Validation
        const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const session = { user };

    let query = supabaseClient
      .from('feed_posts')
      .select('id, content, media_url, likes_count, created_at, community_id, author:profiles(id, full_name, avatar_url), comments:feed_comments(count)')
      .order('created_at', { ascending: false });

    if (communityId) {
       query = query.eq('community_id', communityId);
    } else {
       // Si no envía communityId, deberíamos traer el Feed global del usuario (todas sus comunidades).
       // Para hacerlo simple y rápido: Extraemos id de comunidades primero
       const { data: memberOf } = await supabaseClient.from('members').select('community_id').eq('user_id', session.user.id);
       const { data: ownerOf } = await supabaseClient.from('communities').select('id').eq('creator_id', session.user.id);
       
       const myCommIds: string[] = [];
       if (memberOf) memberOf.forEach(m => myCommIds.push(m.community_id));
       if (ownerOf) ownerOf.forEach(o => myCommIds.push(o.id));
       
       if (myCommIds.length > 0) {
          query = query.in('community_id', myCommIds);
       } else {
          return NextResponse.json({ posts: [] }, { status: 200 }); // User no tiene comunidades
       }
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    
    return NextResponse.json({ posts: data }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const body = await req.json();
    const { communityId, content, type } = body;
    
    if (!communityId || !content) {
       return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from('feed_posts').insert({
       community_id: communityId,
       author_id: user.id,
       media_url: type || 'General',
       content
    }).select('id').single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
