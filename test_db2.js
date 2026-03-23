const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenvConfig = fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
        const [key, ...values] = line.split('=');
        acc[key] = values.join('=').replace(/^"|"$/g, '');
        return acc;
    }, {});

const supabaseUrl = dotenvConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = dotenvConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Query 4: raw error of notifications");
  let res4 = await supabase.from('notifications').select('*').limit(1);
  console.log("Error:", res4.error);
  console.log("Data:", res4.data);
}
run();
