const { getDbClient, initSchema } = require('./db');

let fallbackTreats = [];

module.exports = async function handler(req, res) {
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
      const { princess_name, snack_choice, custom_note } = req.body || {};
      fallbackTreats.unshift({
        id: Date.now(),
        princess_name: princess_name || 'Raj Nandani',
        snack_choice: snack_choice || 'Dairy Milk Silk 🍫',
        custom_note: custom_note || '',
        created_at: new Date().toISOString()
      });
    }
    return res.status(200).json({
      success: true,
      treats: fallbackTreats,
      tursoConnected: false
    });
  }

  await initSchema();

  try {
    if (req.method === 'POST') {
      const { princess_name, snack_choice, custom_note } = req.body || {};
      if (!snack_choice) {
        return res.status(400).json({ success: false, error: 'Snack choice is required.' });
      }

      await db.execute({
        sql: `INSERT INTO treats (princess_name, snack_choice, custom_note) VALUES (?, ?, ?);`,
        args: [
          princess_name || 'Raj Nandani',
          snack_choice,
          (custom_note || '').slice(0, 200)
        ]
      });
    }

    const result = await db.execute(`
      SELECT id, princess_name, snack_choice, custom_note, created_at
      FROM treats
      ORDER BY id DESC
      LIMIT 10;
    `);

    const treats = result.rows.map(row => ({
      id: row.id,
      princess_name: row.princess_name,
      snack_choice: row.snack_choice,
      custom_note: row.custom_note,
      created_at: row.created_at
    }));

    return res.status(200).json({
      success: true,
      treats,
      tursoConnected: true
    });
  } catch (error) {
    console.error('Error in treat API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
