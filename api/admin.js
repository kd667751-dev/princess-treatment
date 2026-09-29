const { getDbClient, initSchema } = require('./db');

const ADMIN_SECRET = '94918';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const reqKey = req.headers['x-admin-key'] || req.query?.key || req.body?.key;

  if (reqKey !== ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid Admin Key. Access Denied.'
    });
  }

  const db = getDbClient();

  if (!db) {
    return res.status(200).json({
      success: true,
      tursoConnected: false,
      message: 'Running in local fallback mode. Turso DB not connected in env.',
      visitors: [],
      messages: [],
      treats: [],
      stats: { hearts: 108, totalVisitors: 0 }
    });
  }

  await initSchema();

  try {
    // Handling Actions
    if (req.method === 'POST') {
      const { action, id } = req.body || {};

      if (action === 'delete_message' && id) {
        await db.execute({ sql: `DELETE FROM messages WHERE id = ?;`, args: [id] });
        return res.status(200).json({ success: true, message: `Message #${id} deleted.` });
      }

      if (action === 'delete_treat' && id) {
        await db.execute({ sql: `DELETE FROM treats WHERE id = ?;`, args: [id] });
        return res.status(200).json({ success: true, message: `Treat #${id} deleted.` });
      }

      if (action === 'clear_visitors') {
        await db.execute(`DELETE FROM visitors;`);
        return res.status(200).json({ success: true, message: 'All visitor logs cleared.' });
      }

      if (action === 'clear_messages') {
        await db.execute(`DELETE FROM messages;`);
        return res.status(200).json({ success: true, message: 'All messages cleared.' });
      }

      if (action === 'clear_treats') {
        await db.execute(`DELETE FROM treats;`);
        return res.status(200).json({ success: true, message: 'All treats cleared.' });
      }

      if (action === 'reset_hearts') {
        await db.execute({
          sql: `INSERT OR REPLACE INTO stats (key, value) VALUES ('hearts', 108);`,
          args: []
        });
        return res.status(200).json({ success: true, message: 'Hearts reset to 108.' });
      }
    }

    // GET Request: Fetch full admin dashboard data
    const visitorsResult = await db.execute(`
      SELECT id, ip, city, region, country, latitude, longitude, network, user_agent, path, code_attempted, status, created_at
      FROM visitors
      ORDER BY id DESC
      LIMIT 100;
    `);

    const messagesResult = await db.execute(`
      SELECT id, sender, content, created_at
      FROM messages
      ORDER BY id DESC
      LIMIT 50;
    `);

    const treatsResult = await db.execute(`
      SELECT id, princess_name, snack_choice, custom_note, created_at
      FROM treats
      ORDER BY id DESC
      LIMIT 50;
    `);

    const statsResult = await db.execute(`
      SELECT key, value FROM stats WHERE key = 'hearts';
    `);

    const countResult = await db.execute(`
      SELECT COUNT(*) as count FROM visitors;
    `);

    const visitors = visitorsResult.rows;
    const messages = messagesResult.rows;
    const treats = treatsResult.rows;
    const hearts = statsResult.rows.length > 0 ? statsResult.rows[0].value : 108;
    const totalVisitors = countResult.rows.length > 0 ? countResult.rows[0].count : visitors.length;

    return res.status(200).json({
      success: true,
      tursoConnected: true,
      stats: {
        hearts,
        totalVisitors,
        totalMessages: messages.length,
        totalTreats: treats.length
      },
      visitors,
      messages,
      treats
    });
  } catch (error) {
    console.error('Error in admin API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
