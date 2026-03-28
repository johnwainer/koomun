import { NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    
    // Auth Check
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bucketName = 'koomun-media';

    // Optional: Auto-create bucket if it doesn't exist (Requires service role in Edge/Server)
    try {
       const { data: buckets } = await supabaseAdmin.storage.listBuckets();
       if (!buckets?.find(b => b.name === bucketName)) {
           await supabaseAdmin.storage.createBucket(bucketName, { public: true });
       }
    } catch(e) { /* ignore bucket check errors */ }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Clean ext
    const extension = file.name.split('.').pop() || 'png';
    const uniqueName = `uploads/${user.id}/${uuidv4()}.${extension}`;

    const { data, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(uniqueName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      });

    if (error) {
       console.error("Storage upload error: ", error);
       throw error;
    }

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(uniqueName);

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
