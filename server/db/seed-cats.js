import openDb, { save } from './connection.js';
import { CAT_BREEDS } from './catBreedsData.mjs';

const insertSql = `INSERT INTO cat_breeds (name, size, coat, cover_type, character_traits, lifespan_min, lifespan_max, activity, nutrition, care, health, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

async function seed() {
  try {
    const db = await openDb();
    db.run('DELETE FROM cat_breeds');
    db.run("DELETE FROM sqlite_sequence WHERE name='cat_breeds'");
    for (const b of CAT_BREEDS) {
      db.run(insertSql, [
        b.name,
        b.size,
        b.coat,
        b.cover_type,
        b.character_traits,
        b.lifespan_min,
        b.lifespan_max,
        b.activity,
        b.nutrition,
        b.care,
        b.health,
        b.image_url || null,
      ]);
    }
    save(db);
    console.log('Добавлено пород кошек:', CAT_BREEDS.length);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
