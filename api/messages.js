const { getDbClient, initSchema } = require('./db');

let fallbackMessages = [
  {
    id: 1,
    sender: 'Someone Nearby ✨',
    content: 'Welcome to your private royal domain, Raj Nandani! The world is infinitely brighter with you in it.',
    created_at: new Date().toISOString()
  }
];

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
      const { sender, content } = req.body || {};
      if (content) {
        const newMsg = {
          id: Date.now(),
          sender: sender || 'Raj Nandani 🌸',
          content: content.slice(0, 300),
          created_at: new Date().toISOString()
        };
        fallbackMessages.unshift(newMsg);
      }
    }
    return res.status(200).json({
      success: true,
      messages: fallbackMessages,
      tursoConnected: false
    });
  }

  await initSchema();

  try {
    if (req.method === 'POST') {
      const { sender, content } = req.body || {};
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ success: false, error: 'Content is required.' });
      }

      await db.execute({
        sql: `INSERT INTO messages (sender, content) VALUES (?, ?);`,
        args: [sender || 'Raj Nandani 🌸', content.slice(0, 300)]
      });
    }

    const result = await db.execute(`
      SELECT id, sender, content, created_at
      FROM messages
      ORDER BY id DESC
      LIMIT 20;
    `);

    const messages = result.rows.map(row => ({
      id: row.id,
      sender: row.sender,
      content: row.content,
      created_at: row.created_at
    }));

    return res.status(200).json({
      success: true,
      messages: messages.length > 0 ? messages : fallbackMessages,
      tursoConnected: true
    });
  } catch (error) {
    console.error('Error in messages API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
