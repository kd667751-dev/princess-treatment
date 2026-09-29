const { createClient } = require('@libsql/client');
require('dotenv').config();

let client = null;
let initialized = false;

function getDbClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return null;
  }

  if (!client) {
    client = createClient({
      url,
      authToken: authToken || undefined,
    });
  }
  return client;
}

async function initSchema() {
  const db = getDbClient();
  if (!db || initialized) return;

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        value INTEGER DEFAULT 0
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS treats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        princess_name TEXT NOT NULL,
        snack_choice TEXT NOT NULL,
        custom_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure initial heart/crown counter exists
    await db.execute({
      sql: `INSERT OR IGNORE INTO stats (key, value) VALUES ('hearts', 108);`,
      args: []
    });

    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Turso schema:', error);
  }
}

module.exports = {
  getDbClient,
  initSchema,
};
