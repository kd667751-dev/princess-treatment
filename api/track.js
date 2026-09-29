const { getDbClient, initSchema } = require('./db');

let fallbackVisitors = [];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
  const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown Device';

  const { path = '/', code_attempted = '', status = 'visit' } = req.body || {};

  const db = getDbClient();

  if (!db) {
    fallbackVisitors.unshift({
      id: Date.now(),
      ip,
      user_agent: userAgent,
      path,
      code_attempted,
      status,
      created_at: new Date().toISOString()
    });
    if (fallbackVisitors.length > 100) fallbackVisitors.pop();
    return res.status(200).json({ success: true, tracked: true, turso: false });
  }

  await initSchema();

  try {
    await db.execute({
      sql: `INSERT INTO visitors (ip, user_agent, path, code_attempted, status) VALUES (?, ?, ?, ?, ?);`,
      args: [ip, userAgent.slice(0, 250), path.slice(0, 50), (code_attempted || '').slice(0, 20), status.slice(0, 20)]
    });

    return res.status(200).json({ success: true, tracked: true, turso: true });
  } catch (error) {
    console.error('Error in visitor tracking API:', error);
    return res.status(200).json({ success: true, tracked: false, error: error.message });
  }
};
