import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    // We increment likes by 1 directly using the RPC or simply selecting and updating.
    // For a production app, an RPC like 'increment_likes' is better, or a separate table.
    // Let's do a simple read then write for MVP.
    const { data: post, error: fetchErr } = await supabaseClient.from('feed_posts').select('likes_count').eq('id', postId).single();
    if (fetchErr || !post) return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });

    const newLikes = (post.likes_count || 0) + 1;
    
    const { error: updateErr } = await supabaseClient.from('feed_posts').update({ likes_count: newLikes }).eq('id', postId);
    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, likes: newLikes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
