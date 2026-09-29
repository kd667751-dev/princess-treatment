require('dotenv').config();
const { getDbClient, initSchema } = require('../api/db');

async function main() {
  const db = getDbClient();
  if (!db) {
    console.log('No TURSO_DATABASE_URL found in environment.');
    process.exit(1);
  }

  await initSchema();
  console.log('Clearing messages...');
  await db.execute('DELETE FROM messages;');
  console.log('Clearing treats...');
  await db.execute('DELETE FROM treats;');
  console.log('Resetting stats...');
  await db.execute({
    sql: `INSERT OR REPLACE INTO stats (key, value) VALUES ('hearts', 108);`,
    args: []
  });
  console.log('✨ Turso DB cleared successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
