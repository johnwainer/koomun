import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { updates } = body; // Array of { id, order_index }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Datos de orden erróneos" }, { status: 400 });
    }

    const promises = updates.map(up => supabaseAdmin.from('content_items').update({ order_index: up.order_index }).eq('id', up.id));
    await Promise.all(promises);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
