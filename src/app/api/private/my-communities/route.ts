import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado", debug_error: authError, token_header: authHeader.substring(0, 20) + "..." }, { status: 401 });
    const session = { user };

    // Comunidades de las que el usuario es miembro
    const { data: memberOf } = await supabaseClient
      .from('members')
      .select('community:communities(id, title, cover_image_url)')
      .eq('user_id', session.user.id);

    // Comunidades creadas por el usuario
    const { data: ownerOf } = await supabaseClient
      .from('communities')
      .select('id, title, cover_image_url')
      .eq('creator_id', session.user.id);

    let list: any[] = [];
    
    if (ownerOf) {
       list = [...ownerOf.map(c => ({
          id: c.id,
          name: c.title,
          image: c.cover_image_url || `https://i.pravatar.cc/150?u=${c.id}`,
          unreads: 0,
          role: 'creator'
       }))];
    }
    
    if (memberOf) {
       memberOf.forEach((member: any) => {
          if (member.community && !list.find(l => l.id === member.community.id)) {
             list.push({
                id: member.community.id,
                name: member.community.title,
                image: member.community.cover_image_url || `https://i.pravatar.cc/150?u=${member.community.id}`,
                unreads: Math.floor(Math.random() * 5), // Mock unreads
                role: 'member'
             });
          }
       });
    }

    return NextResponse.json({ communities: list }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
