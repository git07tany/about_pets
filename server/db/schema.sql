CREATE TABLE IF NOT EXISTS dog_breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  size TEXT NOT NULL CHECK(size IN ('мелкий','средний','крупный')),
  coat TEXT NOT NULL,
  character_traits TEXT NOT NULL,
  lifespan_min INTEGER NOT NULL,
  lifespan_max INTEGER NOT NULL,
  activity TEXT NOT NULL CHECK(activity IN ('низкая','средняя','высокая')),
  care TEXT NOT NULL,
  nutrition TEXT NOT NULL DEFAULT '',
  health TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dog_name ON dog_breeds(name);
CREATE INDEX IF NOT EXISTS idx_dog_size ON dog_breeds(size);
CREATE INDEX IF NOT EXISTS idx_dog_activity ON dog_breeds(activity);

CREATE TABLE IF NOT EXISTS cat_breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  size TEXT NOT NULL CHECK(size IN ('мелкий','средний','крупный')),
  coat TEXT NOT NULL,
  cover_type TEXT NOT NULL,
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
