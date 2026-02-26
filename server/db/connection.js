import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'pets.db');

let dbPromise = null;

async function init() {
  if (dbPromise) return dbPromise;
  const wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  let db;
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schema);
    writeFileSync(dbPath, Buffer.from(db.export()));
  }
  dbPromise = db;
  return db;
}

// Выполнить SELECT и вернуть массив объектов
function query(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Сохранить базу в файл (после сида)
function save(db) {
  writeFileSync(dbPath, Buffer.from(db.export()));
}

export default init;
export { query, save };
