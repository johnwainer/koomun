import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin
      .from('feed_posts')
      .select('*, community:communities(title), author:profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ posts: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    
    // Auto-Mock Handler
    if (body.mock) {
       const { data: communities } = await supabaseAdmin.from('communities').select('id, creator_id').limit(5);
       if (!communities || communities.length === 0) return NextResponse.json({ error: "No communities available" }, { status: 400 });

       const toInsert = communities.map((c, i) => ({
         community_id: c.id,
         author_id: c.creator_id,
         content: `Este es un post de prueba en el muro #${i+1}. ¡Bienvenidos!`,
         likes: Math.floor(Math.random() * 200)
       }));

       const { data, error } = await supabaseAdmin.from('feed_posts').insert(toInsert).select();
       if (error) throw error;
       await logAction({ action: 'CREATE_MOCK', entityType: 'feed_posts', actorId: 'SuperAdmin', metadata: { count: toInsert.length } });
       return NextResponse.json({ success: true, posts: data }, { status: 201 });
    }

    const { data, error } = await supabaseAdmin.from('feed_posts').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabaseAdmin.from('feed_posts').delete().eq('id', id);
    if (error) throw error;
    
    await logAction({ action: 'DELETE', entityType: 'feed_posts', entityId: id, metadata: {} });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
