import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // Get all files for a bot
  if (req.method === 'GET') {
    const { bot_id } = req.query;
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('bot_id', bot_id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  // Create a file record
  if (req.method === 'POST') {
    const file = req.body;
    const { data, error } = await supabase
      .from('files')
      .insert([file])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  // Default - Method Not Allowed
  res.status(405).json({ error: 'Method not allowed' });
}
