const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/private/**/route.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Since we know the typical structure, let's use a simpler regex or simple string replacement.
  const oldCode1 = `     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
     
     if (authError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }`;

  const oldCode2 = `     const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
      
      if (authError || !session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }`;

  const oldCode3 = `    const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
    
    if (authError || !session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }`;

  const oldCode4 = `    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }`;
    
  let wasModified = false;
  
  const repl = `    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const session = { user };`;

  if (content.includes('await supabaseClient.auth.getSession()')) {
     content = content.replace(/const\s+\{\s*data\s*:\s*\{\s*session\s*\}(?:\s*,\s*error:\s*authError)?\s*\}\s*=\s*await\s+supabaseClient\.auth\.getSession\(\);[\s\S]*?(?:if\s*\((?:authError\s*\|\|\s*)?!session\)\s*\{[\s\S]*?return\s+NextResponse\.json\([^\}]+\}\s*,\s*\{\s*status:\s*401\s*\}\);[\s\S]*?\})/g, repl);
     fs.writeFileSync(file, content);
     console.log('Fixed using regex ' + file);
  }
});
