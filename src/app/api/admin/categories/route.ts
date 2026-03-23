import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select(`
        *,
        communities(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ total: categories.length, categories }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, icon } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Falta el nombre de la categoría' }, { status: 400 });
    }

    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");

    const { data: newCategory, error } = await supabaseAdmin
      .from('categories')
      .insert([{ name, slug, icon: icon || 'category' }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAction({
      action: 'CREATE_CATEGORY',
      entityType: 'categories',
      entityId: newCategory.id,
      metadata: { name: newCategory.name }
    });

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await logAction({
      action: 'DELETE_CATEGORY',
      entityType: 'categories',
      entityId: id,
      metadata: { deleted_by: 'admin_panel' }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
