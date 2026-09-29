const { getDbClient, initSchema } = require('./db');

let fallbackHearts = 124;

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getDbClient();

  if (!db) {
    if (req.method === 'POST') {
      fallbackHearts += 1;
    }
    return res.status(200).json({
      success: true,
      hearts: fallbackHearts,
      note: 'Using local in-memory count. Set TURSO_DATABASE_URL to persist to Turso DB.',
    });
  }

  await initSchema();

  try {
    if (req.method === 'POST') {
      await db.execute(`
        INSERT INTO stats (key, value) VALUES ('hearts', 1)
        ON CONFLICT(key) DO UPDATE SET value = value + 1;
      `);
    }

    const result = await db.execute({
      sql: `SELECT value FROM stats WHERE key = 'hearts' LIMIT 1;`,
      args: []
    });

    const hearts = result.rows.length > 0 ? Number(result.rows[0].value) : 1;
    return res.status(200).json({ success: true, hearts });
  } catch (error) {
    console.error('Error in hearts API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
