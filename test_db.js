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
  console.log("Query 1: testing actor:profiles!actor_id");
  let res1 = await supabase.from('notifications').select('actor:profiles!actor_id(id)').limit(1);
  console.log(res1.error || "No error");

  console.log("\nQuery 2: testing actor:profiles!notifications_actor_id_fkey");
  let res2 = await supabase.from('notifications').select('actor:profiles!notifications_actor_id_fkey(id)').limit(1);
  console.log(res2.error || "No error");

  console.log("\nQuery 3: testing user_id:profiles!user_id");
  let res3 = await supabase.from('notifications').select('actor:profiles!user_id(id)').limit(1);
  console.log(res3.error || "No error");

  // What do the columns of notifications look like? Let's query one raw record
  console.log("\nQuery 4: raw columns of notifications");
  let res4 = await supabase.from('notifications').select('*').limit(1);
  console.log(res4.data && res4.data[0] ? Object.keys(res4.data[0]) : "No data/error");
}
run();
