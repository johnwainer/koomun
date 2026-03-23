const fs = require('fs');
const glob = require('glob');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src/app/api/private');

// Find all route.ts inside api/private
const files = glob.sync(`${srcDir}/**/route.ts`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace GET, POST, PUT, DELETE
  ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
    // We basically look for `const { data: { session }...` and replace it with:
    // const authHeader = req.headers.get('Authorization');
    // if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // const token = authHeader.replace('Bearer ', '');
    // const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    // if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // And map `session.user` to `user`
    
    // There are a few variations of the regex needed.
    // The easiest way is string replacement:
      content = content.replace(
        /const\s*\{\s*data\s*:\s*\{\s*session\s*\}(?:,\s*error\s*:\s*authError\s*)?\}\s*=\s*await\s+supabase(?:Client|Admin)\.auth\.getSession\(\);*\s*if\s*\((?:authError\s*\|\|\s*)?!session(?:(?:.+)?)?\)\s*\{\s*(return\s+NextResponse\.json\(\{\s*error:[^;]+\);\s*)\}/g,
        `const authHeader = req.headers.get('Authorization');
     if (!authHeader) {
        $1
     }
     const token = authHeader.replace('Bearer ', '');
     const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
     if (authError || !user) {
        $1
     }
     const session = { user }; // shim for code that uses session.user`
      );
  });

  fs.writeFileSync(file, content);
  console.log('Fixed API:', file);
});

// Now fix the frontend files
const pages = [
  'src/app/dashboard/page.tsx',
  'src/app/feed/page.tsx',
  'src/app/chat/page.tsx',
  'src/app/notifications/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/classroom/page.tsx' // if it exists
];

pages.forEach(page => {
  const file = path.join(process.cwd(), page);
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('fetch("/api/private/')) {
    // Add import { supabaseClient } if missing and we are going to use it
    if (!content.includes('import { supabaseClient }')) {
       // Insert after last import
       content = content.replace(/(import\s+.*?\s+from\s+['"].*?['"];?\n)(?!import)/s, '$1import { supabaseClient } from "@/lib/supabase";\n');
    }
  
    // Replace: const res = await fetch("/api/private/...");
    content = content.replace(
      /(const|let)\s+(\w+)\s*=\s*await\s+fetch\("(\/api\/private\/[^"]+)"\);/g,
      `const { data: { session } } = await supabaseClient.auth.getSession();
          $1 $2 = await fetch("$3", {
             headers: session ? { Authorization: \`Bearer \${session.access_token}\` } : {}
          });`
    );

    // Some fetch calls might have objects (like in profile/page.tsx)
    content = content.replace(
      /await\s+fetch\("(\/api\/private\/[^"]+)"\s*,\s*\{\s*method:\s*"([^"]+)"\s*,\s*body:\s*(JSON\.stringify[^,]+),\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}\s*\}\)/g,
      `await (async () => {
         const { data: { session } } = await supabaseClient.auth.getSession();
         return fetch("$1", {
            method: "$2",
            body: $3,
            headers: { 
               "Content-Type": "application/json",
               ...(session ? { Authorization: \`Bearer \${session.access_token}\` } : {})
            }
         });
      })()`
    );
     // The parameterless fetch cases may be like: const res = await fetch("/api/private/security", { method: "DELETE" });
      content = content.replace(
         /await\s+fetch\("(\/api\/private\/[^"]+)"\s*,\s*\{\s*method:\s*"([A-Z]+)"\s*\}\)/g,
         `await (async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();
            return fetch("$1", {
               method: "$2",
               headers: session ? { Authorization: \`Bearer \${session.access_token}\` } : {}
            });
         })()`
       );

    fs.writeFileSync(file, content);
    console.log('Fixed Page:', file);
  }
});
