import openDb, { save } from "./connection.js";
import { breeds as catBreeds } from "./seed-cats-data.js";

const insertSql = `insert into cat_breeds (name, size, coat, cover_type, character_traits, lifespan_min, lifespan_max, activity, nutrition, care, health, image_url)
  values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

async function seed() {
  try {
    const db = await openDb();
    db.run("delete from cat_breeds");
    db.run("delete from sqlite_sequence where name='cat_breeds'");
    for (const b of catBreeds) {
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
    console.log("Добавлено пород кошек:", catBreeds.length);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
