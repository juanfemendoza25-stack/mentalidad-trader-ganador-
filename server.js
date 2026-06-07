require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Trades API ──────────────────────────────────────

app.get('/api/trades', async (req, res) => {
  try {
    const trades = await db.getAllTrades();
    res.json(trades);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/trades', async (req, res) => {
  try {
    await db.saveTrade(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/trades', async (req, res) => {
  try {
    await db.clearTrades();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/trades/:id', async (req, res) => {
  try {
    await db.deleteTrade(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Claude proxy ────────────────────────────────────

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada en el servidor' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '';
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Error de conexión con Claude: ' + e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Arranque ────────────────────────────────────────

async function start() {
  if (process.env.DATABASE_URL) {
    await db.init();
    console.log('Base de datos inicializada');
  } else {
    console.warn('DATABASE_URL no definida — modo sin base de datos');
  }
  app.listen(PORT, () => {
    console.log(`Psycho Trading corriendo en http://localhost:${PORT}`);
  });
}

start().catch(console.error);
