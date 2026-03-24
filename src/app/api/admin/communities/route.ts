import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { data: communities, error } = await supabaseAdmin
      .from('communities')
      .select(`
        *,
        creator:profiles ( full_name, email, avatar_url ),
        category:categories ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ total: communities.length, communities }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, is_published } = await req.json();

    const { error } = await supabaseAdmin
      .from('communities')
      .update({ is_published })
      .eq('id', id);

    if (error) throw error;
    
    await logAction({
      action: is_published ? 'PUBLISH' : 'UNPUBLISH',
      entityType: 'communities',
      entityId: id,
      metadata: { source: 'admin_panel' }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { id } = await req.json();

    const { error } = await supabaseAdmin
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await logAction({
      action: 'HARD_DELETE',
      entityType: 'communities',
      entityId: id,
      metadata: { deleted_by: 'admin_panel' }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
