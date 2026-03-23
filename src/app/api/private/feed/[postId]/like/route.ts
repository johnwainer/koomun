import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const { data: existingLike, error: findError } = await supabaseAdmin
      .from('feed_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLike) {
      // Removing like
      await supabaseAdmin.from('feed_likes').delete().eq('id', existingLike.id);
      const { data: post } = await supabaseAdmin.from('feed_posts').select('likes_count').eq('id', postId).single();
      const newCount = Math.max(0, (post?.likes_count || 1) - 1);
      await supabaseAdmin.from('feed_posts').update({ likes_count: newCount }).eq('id', postId);
      return NextResponse.json({ success: true, likes: newCount, isLiked: false }, { status: 200 });
    } else {
      // Adding like
      await supabaseAdmin.from('feed_likes').insert({ post_id: postId, user_id: user.id });
      const { data: post } = await supabaseAdmin.from('feed_posts').select('likes_count').eq('id', postId).single();
      const newCount = (post?.likes_count || 0) + 1;
      await supabaseAdmin.from('feed_posts').update({ likes_count: newCount }).eq('id', postId);
      return NextResponse.json({ success: true, likes: newCount, isLiked: true }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
