require('dotenv').config();
const express = require('express');
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
