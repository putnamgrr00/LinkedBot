import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { user_id } = req.query;
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', user_id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const bot = req.body;
    const { data, error } = await supabase
      .from('bots')
      .insert([bot])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (req.method === 'PUT') {
    const { id } = req.body;
    const updates = req.body;
    const { data, error } = await supabase
      .from('bots')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
