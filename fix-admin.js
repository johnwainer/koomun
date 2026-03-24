const fs = require('fs');
const path = require('path');

// 1. ADD HEADERS TO ADMIN PAGES
function addAuthToPages(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addAuthToPages(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We must inject `import { supabaseClient } from '@/lib/supabase';` if not present
      if (!content.includes('supabaseClient') && content.includes('/api/admin/')) {
        content = `import { supabaseClient } from '@/lib/supabase';\n` + content;
      }
      
      // Find `const res = await fetch('/api/admin...` and inject headers dynamically
      let changed = false;
      content = content.replace(/await fetch\(['"`]\/api\/admin\/(.*?)['"`],\s*\{/g, (match) => {
        changed = true;
        return `const { data: { session } } = await supabaseClient.auth.getSession();\n      ${match}\n        headers: session ? { 'Authorization': \`Bearer \${session.access_token}\` } : {},`;
      });
      // also if there are puts/posts:
      content = content.replace(/headers:\s*{\s*'Content-Type':\s*'application\/json'\s*}/g, (match) => {
        return `headers: { 'Content-Type': 'application/json', ...(session ? { 'Authorization': \`Bearer \${session.access_token}\` } : {}) }`;
      });

      if (changed) {
        // Also ensure session is obtained in onClick handlers if needed... Wait, easier to do manual replacements if script is hard
      }
    }
  }
}
