import os, glob, re

# 1. Inject requireAdmin to API routes
api_routes = glob.glob('src/app/api/admin/**/route.ts', recursive=True)
for route in api_routes:
    with open(route, 'r') as f:
        content = f.read()
    
    # Add import
    if "requireAdmin" not in content:
        content = content.replace("from 'next/server';", "from 'next/server';\nimport { requireAdmin } from '@/lib/serverAuth';")
    
    # Add auth check to GET/POST/PUT/DELETE
    for method in ['GET', 'POST', 'PUT', 'DELETE']:
        sig = f'export async function {method}(req: Request) {{'
        # Also handle Next 15 Request, Response params if any
        sig2 = f'export async function {method}(req: Request, '
        
        # We find where function starts:
        def insert_auth(text, func_def):
            parts = text.split(func_def)
            if len(parts) > 1:
                replacement = func_def + """
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
"""
                return parts[0] + replacement + parts[1]
            return text
            
        content = insert_auth(content, sig)
        # Try finding sig with context params
        if 'export async function' in content:
            # simple regex
            content = re.sub(f'export async function {method}\\(req: Request(.*?)\\) {{\\n  try {{', f'export async function {method}(req: Request\\1) {{\\n  const auth = await requireAdmin(req);\\n  if (auth.error) return auth.error;\\n  try {{', content)
            
    with open(route, 'w') as f:
        f.write(content)

# 2. Fix admin frontend pages (add auth token fetch)
admin_pages = glob.glob('src/app/admin/**/page.tsx', recursive=True)
for page in admin_pages:
    with open(page, 'r') as f:
        content = f.read()

    # ensure fetch receives supabaseClient token
    if "import { supabaseClient }" not in content:
        content = "import { supabaseClient } from '@/lib/supabase';\n" + content

    # Replace specific fetch calls
    content = re.sub(r"await fetch\('(/api/admin/[^']+)',\s*{(.*?)}\);", r"await fetch('\1', { headers: { Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` }, \2 });", content, flags=re.DOTALL)
    
    # Fix the empty object ones:
    content = re.sub(r"await fetch\('(/api/admin/[^']+)'\)", r"await fetch('\1', { headers: { Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}` } })", content)

    with open(page, 'w') as f:
        f.write(content)

# 3. Strip console.logs and console.errors silently from frontend code ONLY
# Let's skip console.error inside catch blocks for APIs because server needs to log.
frontend_files = glob.glob('src/app/**/*.tsx', recursive=True)
for file in frontend_files:
    with open(file, 'r') as f:
        content = f.read()
    content = re.sub(r'console\.log\([^;]*\);?', '', content)
    content = re.sub(r'console\.error\([^;]*\);?', '', content)
    with open(file, 'w') as f:
        f.write(content)

print("Patch applied")
