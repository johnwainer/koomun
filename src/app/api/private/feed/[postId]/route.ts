import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { error } = await supabaseAdmin.from('feed_posts').delete().eq('id', postId).eq('author_id', user.id);
    if(error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const body = await req.json();
    const { content } = body;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { error } = await supabaseAdmin.from('feed_posts').update({ content }).eq('id', postId).eq('author_id', user.id);
    if(error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
