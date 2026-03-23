import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const communityId = url.searchParams.get('communityId');
    
    // Auth Validation
        const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const session = { user };

    if (!communityId) {
        return NextResponse.json({ error: "Comunidad no especificada" }, { status: 400 });
    }

    // Traer todos los módulos de esa comunidad (librería de contenidos)
    const { data: modules, error } = await supabaseClient
      .from('content_modules')
      .select('id, title, description, order_index')
      .eq('community_id', communityId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    
    // También traer los items de esos módulos para dar un preview
    const moduleIds = modules.map(m => m.id);
    let itemsByModule: any = {};
    
    if (moduleIds.length > 0) {
        const { data: items } = await supabaseClient
          .from('content_items')
          .select('id, module_id, type, title')
          .in('module_id', moduleIds);
          
        if (items) {
           items.forEach(item => {
              if (!itemsByModule[item.module_id]) {
                 itemsByModule[item.module_id] = [];
              }
              itemsByModule[item.module_id].push(item);
           });
        }
    }

    const fullModules = modules.map(m => ({
        ...m,
        items: itemsByModule[m.id] || []
    }));

    return NextResponse.json({ library: fullModules }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
