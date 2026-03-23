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
  console.log("Query 5: testing actor:profiles!actor_id again");
  let res5 = await supabase.from('notifications').select('id, type, actor_id, action_text, target_text, is_read, created_at, actor:profiles!actor_id(first_name, last_name, avatar_url)').limit(1);
  console.log(res5);
}
run();
