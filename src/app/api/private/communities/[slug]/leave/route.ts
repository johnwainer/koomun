import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    // Auth Validation via header or cookie
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Fetch Community ID using slug 
    const { data: comm, error: commError } = await supabaseAdmin.from('communities').select('id, creator_id').eq('slug', slug).single();
    if (commError || !comm) return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });

    // Prevent creator from leaving mapping if business rule says creator shouldn't normally do it, but we can just delete it anyway.
    if (comm.creator_id === user.id) {
       return NextResponse.json({ error: "El creador no puede abandonar su propia comunidad, elimínala desde ajustes si lo deseas." }, { status: 403 });
    }

    // Delete membership (Admin mode bypass RLS)
    await supabaseAdmin.from('members').delete().match({ user_id: user.id, community_id: comm.id });

    // "se borra toda mi participacion en ella" -> deletes posts and comments in that community to honor GDPR-like or explicitly requested behavior.
    // feed_posts deletion cascades to feed_comments tied to those posts.
    await supabaseAdmin.from('feed_posts').delete().match({ author_id: user.id, community_id: comm.id });

    // Wait, what if the user commented on OTHER people's posts in this community?
    // Let's delete comments specifically authored by the user where the post is part of the community
    const { data: commPosts } = await supabaseAdmin.from('feed_posts').select('id').eq('community_id', comm.id);
    if (commPosts && commPosts.length > 0) {
        const postIds = commPosts.map(p => p.id);
        await supabaseAdmin.from('feed_comments').delete()
            .in('post_id', postIds)
            .eq('author_id', user.id);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
