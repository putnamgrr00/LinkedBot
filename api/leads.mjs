export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // Get all leads for a bot
  if (req.method === 'GET') {
    const { bot_id } = req.query;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('bot_id', bot_id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  // Create a lead record
  if (req.method === 'POST') {
    const lead = req.body;
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  // Default - Method Not Allowed
  res.status(405).json({ error: 'Method not allowed' });
}
