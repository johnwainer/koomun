const fs = require('fs');
const path = require('path');

const pages = [
  'src/app/c/[slug]/page.tsx',
  'src/components/CommunitySwitcher.tsx'
];

pages.forEach(page => {
  const file = path.join(process.cwd(), page);
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import { supabaseClient } if missing and we are going to use it
  if (!content.includes('import { supabaseClient }')) {
     // Insert after last import
     content = content.replace(/(import\s+.*?\s+from\s+['"].*?['"];?\n)(?!import)/s, '$1import { supabaseClient } from "@/lib/supabase";\n');
  }

  // Replace: const res = await fetch("/api/private/...");
  // or `fetch(\`/api/private/communities/\${slug}\`)`
  content = content.replace(
    /(const|let)\s+(\w+)\s*=\s*await\s+fetch\(([`"][\/]api[\/]private[\/][^`"]+[`"])\);/g,
    `const { data: { session } } = await supabaseClient.auth.getSession();
          $1 $2 = await fetch($3, {
             headers: session ? { Authorization: \`Bearer \${session.access_token}\` } : {}
          });`
  );

  fs.writeFileSync(file, content);
  console.log('Fixed:', file);
});
