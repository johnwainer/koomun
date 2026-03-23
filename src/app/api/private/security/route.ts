import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { supabaseClient } from '@/lib/supabase';

export const dynamic = "force-dynamic";

// Change password
export async function PUT(req: Request) {
  try {
     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     if (authError || !session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     const { password } = await req.json();
     if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

     // This updates the currently logged in user's password
     const { error } = await supabaseAdmin.auth.admin.updateUserById(
       session.user.id,
       { password: password }
     );

     if (error) throw error;
     
     return NextResponse.json({ success: true }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Delete account
export async function DELETE(req: Request) {
  try {
     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     if (authError || !session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     // Uses admin to delete the user from auth.users (cascade takes care of the rest)
     const { error } = await supabaseAdmin.auth.admin.deleteUser(session.user.id);
     
     if (error) throw error;

     return NextResponse.json({ success: true }, { status: 200 });
  } catch(e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
