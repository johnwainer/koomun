const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: communities } = await supabase.from('communities').select('id');
  if(!communities) return;
  
  const toUpdate = communities.slice(0, Math.floor(communities.length / 2));
  
  for(const c of toUpdate) {
     await supabase.from('communities').update({ price_tier: 'Gratis' }).eq('id', c.id);
  }
  console.log('Fixed ' + toUpdate.length + ' communities to Gratis');
}
run();
