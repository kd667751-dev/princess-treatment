const { getDbClient, initSchema } = require('./db');

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
    return res.status(200).json({
      success: true,
      message: 'No Turso DB credentials configured in environment. Local fallback state is clean.',
      tursoConnected: false
    });
  }

  await initSchema();

  try {
    // 1. Clear all test messages
    await db.execute('DELETE FROM messages;');

    // 2. Clear all test treats/orders
    await db.execute('DELETE FROM treats;');

    // 3. Reset hearts/crown counter to 108
    await db.execute({
      sql: `INSERT OR REPLACE INTO stats (key, value) VALUES ('hearts', 108);`,
      args: []
    });

    return res.status(200).json({
      success: true,
      message: '✨ Turso Database Cleared Successfully! All test messages, notes, and snacks have been wiped clean.',
      tursoConnected: true,
      stats: {
        hearts: 108,
        messagesCount: 0,
        treatsCount: 0
      }
    });
  } catch (error) {
    console.error('Error clearing Turso DB:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
