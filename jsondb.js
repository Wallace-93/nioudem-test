import fs from 'node:fs/promises';

export async function getDB() {
  const data = await fs.readFile('db.json', 'utf8');
  return JSON.parse(data);
}

export async function setDB(db) {
  await fs.writeFile('db.json', JSON.stringify(db, null, 2));
}
