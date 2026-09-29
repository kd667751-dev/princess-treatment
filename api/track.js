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

  // 1. Primary: Extract Vercel Edge Geolocation Headers (100% automatic, highly accurate)
  let city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
  let region = req.headers['x-vercel-ip-country-region'] || '';
  let country = req.headers['x-vercel-ip-country'] || '';
  let latitude = req.headers['x-vercel-ip-latitude'] || '';
  let longitude = req.headers['x-vercel-ip-longitude'] || '';
  let network = '';

  // 2. Secondary: Fast fallback via ip-api if Vercel headers not present
  if ((!city || !country) && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,lat,lon,isp`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.status === 'success') {
          city = city || geoData.city || '';
          region = region || geoData.regionName || '';
          country = country || geoData.country || '';
          latitude = latitude || (geoData.lat ? String(geoData.lat) : '');
          longitude = longitude || (geoData.lon ? String(geoData.lon) : '');
          network = geoData.isp || '';
        }
      }
    } catch (e) {
      // Non-blocking fallback
    }
  }

  const db = getDbClient();

  if (!db) {
    fallbackVisitors.unshift({
      id: Date.now(),
      ip,
      city,
      region,
      country,
      latitude,
      longitude,
      network,
      user_agent: userAgent,
      path,
      code_attempted,
      status,
      created_at: new Date().toISOString()
    });
    if (fallbackVisitors.length > 100) fallbackVisitors.pop();
    return res.status(200).json({ success: true, tracked: true, turso: false, city, country });
  }

  await initSchema();

  try {
    await db.execute({
      sql: `INSERT INTO visitors (ip, city, region, country, latitude, longitude, network, user_agent, path, code_attempted, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        ip,
        city.slice(0, 50),
        region.slice(0, 50),
        country.slice(0, 50),
        latitude.slice(0, 20),
        longitude.slice(0, 20),
        network.slice(0, 80),
        userAgent.slice(0, 250),
        path.slice(0, 50),
        (code_attempted || '').slice(0, 20),
        status.slice(0, 20)
      ]
    });

    return res.status(200).json({ success: true, tracked: true, turso: true, city, country });
  } catch (error) {
    console.error('Error in visitor tracking API:', error);
    return res.status(200).json({ success: true, tracked: false, error: error.message });
  }
};
