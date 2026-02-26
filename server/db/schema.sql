-- SQLite: база для сайта о питомцах (2026)
-- Таблица создаётся автоматически при запуске сервера или сида

CREATE TABLE IF NOT EXISTS dog_breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  size TEXT NOT NULL CHECK(size IN ('мелкий','средний','крупный')),
  coat TEXT NOT NULL,
  character_traits TEXT NOT NULL,
  lifespan_min INTEGER NOT NULL,
  lifespan_max INTEGER NOT NULL,
  activity TEXT NOT NULL CHECK(activity IN ('низкий','средний','высокий')),
  care TEXT NOT NULL,
  health TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dog_name ON dog_breeds(name);
CREATE INDEX IF NOT EXISTS idx_dog_size ON dog_breeds(size);
CREATE INDEX IF NOT EXISTS idx_dog_activity ON dog_breeds(activity);
