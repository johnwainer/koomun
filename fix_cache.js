const fs = require('fs');
const glob = require('glob');

const pages = [
  'src/app/dashboard/page.tsx',
  'src/app/feed/page.tsx',
  'src/app/chat/page.tsx',
  'src/app/notifications/page.tsx',
  'src/app/profile/page.tsx',
  'src/components/CommunitySwitcher.tsx',
  'src/app/c/[slug]/page.tsx'
];

pages.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace fetch("/api/private/...") with fetch("...", { cache: 'no-store', ... })
  // The fetch calls we injected recently look like:
  // const res = await fetch("/api/private/my-communities", {
  //    headers: session ? { Authorization: \`Bearer \${session.access_token}\` } : {}
  // });
  
  content = content.replace(/(await\s+fetch\([^\,]+,\s*\{)/g, "$1 cache: 'no-store', ");
  
  // also for fetch without second argument (there shouldn't be any now since we added headers to all)
  
  fs.writeFileSync(file, content);
  console.log("Updated", file);
});
