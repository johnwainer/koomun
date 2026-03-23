import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: creatorsFromDb, error } = await supabaseClient
      .from('profiles')
      .select('id, full_name, plan, bio, role, avatar_url, username, communities(id, is_published, members(count))')
      .in('role', ['creator', 'admin', 'super_admin'])
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const creators = creatorsFromDb?.map(c => {
      let totalMembers = 0;
      let activeCommunities = 0;
      if (c.communities && Array.isArray(c.communities)) {
         c.communities.forEach((comm: any) => {
            if (comm.is_published) activeCommunities++;
            if (comm.members && comm.members.length > 0 && comm.members[0].count) {
               totalMembers += comm.members[0].count;
            }
         });
      }
      return {
         ...c,
         total_members: totalMembers,
         active_communities_count: activeCommunities
      };
    }) || [];

    return NextResponse.json({ creators }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
