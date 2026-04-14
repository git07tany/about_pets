import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));

// путь к файлу sqlite из переменной окружения или облачная data или рядом с этим модулем
function resolveDbFilePath() {
  if (process.env.PETS_DB_PATH) return path.resolve(process.env.PETS_DB_PATH);
  try {
    if (existsSync("/data")) return path.join("/data", "pets.db");
  } catch {
    void 0;
  }
  return path.join(dir, "pets.db");
}

const file = resolveDbFilePath();

let cache = null;

// один раз поднимаем wasm sql js дальше отдаём тот же объект базы из памяти
export default async function openDb() {
  if (cache) return cache;
  const wasm = path.join(
    dir,
    "..",
    "node_modules",
    "sql.js",
    "dist",
    "sql-wasm.wasm",
  );
  const sqlJs = await initSqlJs({ locateFile: () => wasm });
  let db;
  if (existsSync(file)) {
    db = new sqlJs.Database(readFileSync(file));
  } else {
    // первый запуск создаём пустую схему из sql файла и сразу пишем на диск
    db = new sqlJs.Database();
    db.exec(readFileSync(path.join(dir, "schema.sql"), "utf-8"));
    writeFileSync(file, Buffer.from(db.export()));
  }
  // подтянуть старые базы к текущей схеме без ручного пересоздания файла
  fixActivity(db);
  catsTable(db);
  catCoverCol(db);
  dogNutritionCol(db);
  smallTable(db);
  cache = db;
  return db;
}

// если в старой базе нет cover_type добавляем колонку и сохраняем файл
function catCoverCol(db) {
  const st = db.prepare("pragma table_info(cat_breeds)");
  const cols = [];
  while (st.step()) cols.push(st.getAsObject());
  st.free();
  if (cols.some((c) => c.name === "cover_type")) return;
  db.exec(
    "alter table cat_breeds add column cover_type text not null default ''",
  );
  writeFileSync(file, Buffer.from(db.export()));
}

// то же для поля nutrition у собак
function dogNutritionCol(db) {
  const st = db.prepare("pragma table_info(dog_breeds)");
  const cols = [];
  while (st.step()) cols.push(st.getAsObject());
  st.free();
  if (cols.some((c) => c.name === "nutrition")) return;
  db.exec(
    "alter table dog_breeds add column nutrition text not null default ''",
  );
  writeFileSync(file, Buffer.from(db.export()));
}

// вытащить текст create table из служебной таблицы sqlite чтобы понять версию схемы
function tableSql(db, name) {
  const st = db.prepare(
    "select sql from sqlite_master where type='table' and name=?",
  );
  st.bind([name]);
  if (!st.step()) {
    st.free();
    return "";
  }
  const row = st.getAsObject();
  st.free();
  return row.sql || "";
}

// раньше активность хранилась как низкий средний высокий переделываем на низкая средняя высокая через новую таблицу
function fixActivity(db) {
  const dogOld = tableSql(db, "dog_breeds");
  const catOld = tableSql(db, "cat_breeds");
  if (dogOld.includes("'низкий'") && dogOld.includes("dog_breeds")) {
    db.exec(`
      create table dog_breeds_new (
        id integer primary key autoincrement,
        name text not null,
        size text not null check(size in ('мелкий','средний','крупный')),
        coat text not null,
        character_traits text not null,
        lifespan_min integer not null,
        lifespan_max integer not null,
        activity text not null check(activity in ('низкая','средняя','высокая')),
        care text not null,
        health text not null,
        image_url text,
        created_at text default (datetime('now'))
      );
      insert into dog_breeds_new select id, name, size, coat, character_traits, lifespan_min, lifespan_max,
        case activity when 'низкий' then 'низкая' when 'средний' then 'средняя' when 'высокий' then 'высокая' else activity end,
        care, health, image_url, created_at from dog_breeds;
      drop table dog_breeds;
      alter table dog_breeds_new rename to dog_breeds;
      create index if not exists idx_dog_name on dog_breeds(name);
      create index if not exists idx_dog_size on dog_breeds(size);
      create index if not exists idx_dog_activity on dog_breeds(activity);
    `);
  }
  if (catOld.includes("'низкий'") && catOld.includes("cat_breeds")) {
    db.exec(`
      create table cat_breeds_new (
        id integer primary key autoincrement,
        name text not null,
        size text not null check(size in ('мелкий','средний','крупный')),
        coat text not null,
        character_traits text not null,
        lifespan_min integer not null,
        lifespan_max integer not null,
        activity text not null check(activity in ('низкая','средняя','высокая')),
        nutrition text not null,
        care text not null,
        health text not null,
        image_url text,
        created_at text default (datetime('now'))
      );
      insert into cat_breeds_new select id, name, size, coat, character_traits, lifespan_min, lifespan_max,
        case activity when 'низкий' then 'низкая' when 'средний' then 'средняя' when 'высокий' then 'высокая' else activity end,
        nutrition, care, health, image_url, created_at from cat_breeds;
      drop table cat_breeds;
      alter table cat_breeds_new rename to cat_breeds;
      create index if not exists idx_cat_name on cat_breeds(name);
      create index if not exists idx_cat_size on cat_breeds(size);
      create index if not exists idx_cat_activity on cat_breeds(activity);
    `);
  }
}

// грызуны если таблицы ещё нет создаём индексы тоже
function smallTable(db) {
  db.exec(`
    create table if not exists small_pet_breeds (
      id integer primary key autoincrement,
      name text not null,
      species text not null check(species in ('хомяк','крыса','мышь','морская свинка','кролик')),
      care_level text not null check(care_level in ('лёгкий','средний','сложный')),
      lifespan_min integer not null,
      lifespan_max integer not null,
      nutrition text not null,
      care text not null,
      health text not null,
      image_url text,
      created_at text default (datetime('now'))
    );
    create index if not exists idx_small_pet_name on small_pet_breeds(name);
    create index if not exists idx_small_pet_species on small_pet_breeds(species);
    create index if not exists idx_small_pet_care on small_pet_breeds(care_level);
  `);
  writeFileSync(file, Buffer.from(db.export()));
}

// кошки create if not exists чтобы не падать на пустой или частичной базе
function catsTable(db) {
  db.exec(`
    create table if not exists cat_breeds (
      id integer primary key autoincrement,
      name text not null,
      size text not null check(size in ('мелкий','средний','крупный')),
      coat text not null,
      cover_type text not null default '',
      character_traits text not null,
      lifespan_min integer not null,
      lifespan_max integer not null,
      activity text not null check(activity in ('низкая','средняя','высокая')),
      nutrition text not null,
      care text not null,
      health text not null,
      image_url text,
      created_at text default (datetime('now'))
    );
    create index if not exists idx_cat_name on cat_breeds(name);
    create index if not exists idx_cat_size on cat_breeds(size);
    create index if not exists idx_cat_activity on cat_breeds(activity);
  `);
  writeFileSync(file, Buffer.from(db.export()));
}

// удобно для express один select в массив объектов
export function runSelect(db, sql, params = []) {
  const st = db.prepare(sql);
  if (params.length) st.bind(params);
  const rows = [];
  while (st.step()) rows.push(st.getAsObject());
  st.free();
  return rows;
}

// после seed или ручных изменений выгрузить бинарник sqlite обратно в pets db
export function save(db) {
  writeFileSync(file, Buffer.from(db.export()));
}
