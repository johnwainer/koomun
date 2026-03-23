import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: creators, error } = await supabaseClient
      .from('profiles')
      .select('id, full_name, plan, bio, role, avatar_url, communities(count)')
      .in('role', ['creator', 'admin', 'super_admin'])
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ creators }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
