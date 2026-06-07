const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trades (
      id BIGINT PRIMARY KEY,
      date TIMESTAMPTZ NOT NULL,
      dir VARCHAR(4),
      entry NUMERIC,
      sl NUMERIC,
      tp NUMERIC,
      lots NUMERIC,
      session VARCHAR(30),
      pnl NUMERIC DEFAULT 0,
      result VARCHAR(10),
      rr NUMERIC,
      reason TEXT,
      reflection TEXT,
      pre_mood VARCHAR(20),
      post_mood VARCHAR(20),
      fears TEXT[],
      follow_plan VARCHAR(10),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getAllTrades() {
  const { rows } = await pool.query(
    'SELECT * FROM trades ORDER BY date DESC'
  );
  return rows.map(dbToTrade);
}

async function saveTrade(t) {
  await pool.query(
    `INSERT INTO trades
      (id, date, dir, entry, sl, tp, lots, session, pnl, result, rr, reason, reflection, pre_mood, post_mood, fears, follow_plan)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (id) DO UPDATE SET
      pnl=EXCLUDED.pnl, result=EXCLUDED.result, reflection=EXCLUDED.reflection,
      post_mood=EXCLUDED.post_mood`,
    [
      t.id, t.date, t.dir, t.entry || null, t.sl || null, t.tp || null,
      t.lots || null, t.session, t.pnl || 0, t.result || null,
      t.rr || null, t.reason || null, t.reflection || null,
      t.preMood || null, t.postMood || null,
      t.fears || [], serializePlan(t.followPlan)
    ]
  );
}

async function deleteTrade(id) {
  await pool.query('DELETE FROM trades WHERE id = $1', [id]);
}

async function clearTrades() {
  await pool.query('DELETE FROM trades');
}

function dbToTrade(r) {
  return {
    id: Number(r.id),
    date: r.date,
    dir: r.dir,
    entry: r.entry !== null ? Number(r.entry) : null,
    sl: r.sl !== null ? Number(r.sl) : null,
    tp: r.tp !== null ? Number(r.tp) : null,
    lots: r.lots !== null ? Number(r.lots) : null,
    session: r.session,
    pnl: Number(r.pnl),
    result: r.result,
    rr: r.rr !== null ? Number(r.rr) : null,
    reason: r.reason,
    reflection: r.reflection,
    preMood: r.pre_mood,
    postMood: r.post_mood,
    fears: r.fears || [],
    followPlan: parsePlan(r.follow_plan)
  };
}

function serializePlan(v) {
  if (v === true) return 'yes';
  if (v === false) return 'no';
  if (v === 'partial') return 'partial';
  return null;
}

function parsePlan(v) {
  if (v === 'yes') return true;
  if (v === 'no') return false;
  if (v === 'partial') return 'partial';
  return null;
}

module.exports = { init, getAllTrades, saveTrade, deleteTrade, clearTrades };
