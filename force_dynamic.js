const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/private/**/route.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('export const dynamic')) {
    content = content.replace(/(import\s+.*?\s*from\s+['"].*?['"];?\n)(?!import)/s, '$1\nexport const dynamic = "force-dynamic";\n');
    fs.writeFileSync(file, content);
    console.log("Added force-dynamic to", file);
  }
});
