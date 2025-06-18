import { createClient } from './node_modules/@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const { data, error, count } = await supabase
      .from('doctor_profiles')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ count: count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}