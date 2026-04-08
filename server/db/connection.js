import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, 'pets.db');

let cache = null;

export default async function openDb() {
  if (cache) return cache;
  const wasm = path.join(dir, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ locateFile: () => wasm });
  let db;
  if (existsSync(file)) {
    db = new SQL.Database(readFileSync(file));
  } else {
    db = new SQL.Database();
    db.exec(readFileSync(path.join(dir, 'schema.sql'), 'utf-8'));
    writeFileSync(file, Buffer.from(db.export()));
  }
  fixActivity(db);
  catsTable(db);
  catCoverCol(db);
  dogNutritionCol(db);
  smallTable(db);
  cache = db;
  return db;
}

function catCoverCol(db) {
  const st = db.prepare('PRAGMA table_info(cat_breeds)');
  const cols = [];
  while (st.step()) cols.push(st.getAsObject());
  st.free();
  if (cols.some((c) => c.name === 'cover_type')) return;
  db.exec("ALTER TABLE cat_breeds ADD COLUMN cover_type TEXT NOT NULL DEFAULT ''");
  writeFileSync(file, Buffer.from(db.export()));
}

function dogNutritionCol(db) {
  const st = db.prepare('PRAGMA table_info(dog_breeds)');
  const cols = [];
  while (st.step()) cols.push(st.getAsObject());
  st.free();
  if (cols.some((c) => c.name === 'nutrition')) return;
  db.exec("ALTER TABLE dog_breeds ADD COLUMN nutrition TEXT NOT NULL DEFAULT ''");
  writeFileSync(file, Buffer.from(db.export()));
}

function tableSql(db, name) {
  const st = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?");
  st.bind([name]);
  if (!st.step()) {
    st.free();
    return '';
  }
  const row = st.getAsObject();
  st.free();
  return row.sql || '';
}

function fixActivity(db) {
  const dogOld = tableSql(db, 'dog_breeds');
  const catOld = tableSql(db, 'cat_breeds');
  if (dogOld.includes("'низкий'") && dogOld.includes('dog_breeds')) {
    db.exec(`
      CREATE TABLE dog_breeds_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        size TEXT NOT NULL CHECK(size IN ('мелкий','средний','крупный')),
        coat TEXT NOT NULL,
        character_traits TEXT NOT NULL,
        lifespan_min INTEGER NOT NULL,
        lifespan_max INTEGER NOT NULL,
        activity TEXT NOT NULL CHECK(activity IN ('низкая','средняя','высокая')),
        care TEXT NOT NULL,
        health TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO dog_breeds_new SELECT id, name, size, coat, character_traits, lifespan_min, lifespan_max,
        CASE activity WHEN 'низкий' THEN 'низкая' WHEN 'средний' THEN 'средняя' WHEN 'высокий' THEN 'высокая' ELSE activity END,
        care, health, image_url, created_at FROM dog_breeds;
      DROP TABLE dog_breeds;
      ALTER TABLE dog_breeds_new RENAME TO dog_breeds;
      CREATE INDEX IF NOT EXISTS idx_dog_name ON dog_breeds(name);
      CREATE INDEX IF NOT EXISTS idx_dog_size ON dog_breeds(size);
      CREATE INDEX IF NOT EXISTS idx_dog_activity ON dog_breeds(activity);
    `);
  }
  if (catOld.includes("'низкий'") && catOld.includes('cat_breeds')) {
    db.exec(`
      CREATE TABLE cat_breeds_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        size TEXT NOT NULL CHECK(size IN ('мелкий','средний','крупный')),
        coat TEXT NOT NULL,
        character_traits TEXT NOT NULL,
        lifespan_min INTEGER NOT NULL,
        lifespan_max INTEGER NOT NULL,
        activity TEXT NOT NULL CHECK(activity IN ('низкая','средняя','высокая')),
        nutrition TEXT NOT NULL,
        care TEXT NOT NULL,
        health TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO cat_breeds_new SELECT id, name, size, coat, character_traits, lifespan_min, lifespan_max,
        CASE activity WHEN 'низкий' THEN 'низкая' WHEN 'средний' THEN 'средняя' WHEN 'высокий' THEN 'высокая' ELSE activity END,
        nutrition, care, health, image_url, created_at FROM cat_breeds;
      DROP TABLE cat_breeds;
      ALTER TABLE cat_breeds_new RENAME TO cat_breeds;
      CREATE INDEX IF NOT EXISTS idx_cat_name ON cat_breeds(name);
      CREATE INDEX IF NOT EXISTS idx_cat_size ON cat_breeds(size);
      CREATE INDEX IF NOT EXISTS idx_cat_activity ON cat_breeds(activity);
    `);
  }
}

function smallTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS small_pet_breeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL CHECK(species IN ('хомяк','крыса','мышь','морская свинка','кролик')),
      care_level TEXT NOT NULL CHECK(care_level IN ('лёгкий','средний','сложный')),
      lifespan_min INTEGER NOT NULL,
      lifespan_max INTEGER NOT NULL,
      nutrition TEXT NOT NULL,
      care TEXT NOT NULL,
      health TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_small_pet_name ON small_pet_breeds(name);
    CREATE INDEX IF NOT EXISTS idx_small_pet_species ON small_pet_breeds(species);
    CREATE INDEX IF NOT EXISTS idx_small_pet_care ON small_pet_breeds(care_level);
  `);
  writeFileSync(file, Buffer.from(db.export()));
}

function catsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cat_breeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      size TEXT NOT NULL CHECK(size IN ('мелкий','средний','крупный')),
      coat TEXT NOT NULL,
      cover_type TEXT NOT NULL DEFAULT '',
      character_traits TEXT NOT NULL,
      lifespan_min INTEGER NOT NULL,
      lifespan_max INTEGER NOT NULL,
      activity TEXT NOT NULL CHECK(activity IN ('низкая','средняя','высокая')),
      nutrition TEXT NOT NULL,
      care TEXT NOT NULL,
      health TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cat_name ON cat_breeds(name);
    CREATE INDEX IF NOT EXISTS idx_cat_size ON cat_breeds(size);
    CREATE INDEX IF NOT EXISTS idx_cat_activity ON cat_breeds(activity);
  `);
  writeFileSync(file, Buffer.from(db.export()));
}

export function runSelect(db, sql, params = []) {
  const st = db.prepare(sql);
  if (params.length) st.bind(params);
  const rows = [];
  while (st.step()) rows.push(st.getAsObject());
  st.free();
  return rows;
}

export function save(db) {
  writeFileSync(file, Buffer.from(db.export()));
}
