import { getDB, setDB } from './jsondb.js';

async function main() {
  const db = await getDB();
  console.log('Current DB:', db);
  
  db.test = 'It works!';
  await setDB(db);
  
  console.log('Updated DB:', await getDB());
}

main();
