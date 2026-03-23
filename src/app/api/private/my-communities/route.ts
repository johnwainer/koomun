import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
