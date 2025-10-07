require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Health check
app.get('/', (req, res) => {
  res.send("Chatbot Backend API is running!");
});

// Get all bots for a user
app.get('/api/bots/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('user_id', user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create a new bot
app.post('/api/bots', async (req, res) => {
  const bot = req.body;
  const { data, error } = await supabase
    .from('bots')
    .insert([bot])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// Update a bot
app.put('/api/bots/:id', async (req, res) => {
  const bot_id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase
    .from('bots')
    .update(updates)
    .eq('id', bot_id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// Delete a bot
app.delete('/api/bots/:id', async (req, res) => {
  const bot_id = req.params.id;
  const { data, error } = await supabase
    .from('bots')
    .delete()
    .eq('id', bot_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Bot deleted successfully' });
});

// Get messages for a bot
app.get('/api/messages/:bot_id', async (req, res) => {
  const bot_id = req.params.bot_id;
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('bot_id', bot_id)
    .order('created_at', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get leads for a bot
app.get('/api/leads/:bot_id', async (req, res) => {
  const bot_id = req.params.bot_id;
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('bot_id', bot_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
