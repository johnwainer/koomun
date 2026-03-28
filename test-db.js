import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://yistfhdyrglqqkqvirqm.supabase.co', 'sb_publishable_FIIB057jRrORir0d31V_zg_O2oW9psa');
async function test() {
  const { data, error } = await supabase.from('communities').select('features').limit(1);
  console.log(error);
}
test();
