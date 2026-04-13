-- собаки
-- id - порядковый номер в таблице, база сама ставит следующий
-- coat - про шерсть (короткая, длинная и т.п.).
-- character_traits - характер, поведение одной строкой.
-- lifespan_min, lifespan_max - сколько живут
-- created_at - когда запись добавили (время от базы)

create table if not exists dog_breeds (
  id integer primary key autoincrement,
  name text not null,
  size text not null check(size in ('мелкий','средний','крупный')),
  coat text not null,
  character_traits text not null,
  lifespan_min integer not null,
  lifespan_max integer not null,
  activity text not null check(activity in ('низкая','средняя','высокая')),
  care text not null,
  nutrition text not null default '',
  health text not null,
  image_url text,
  created_at text default (datetime('now'))
);

-- индексы - чтобы по имени, размеру и активности быстрее искать
create index if not exists idx_dog_name on dog_breeds(name);
create index if not exists idx_dog_size on dog_breeds(size);
create index if not exists idx_dog_activity on dog_breeds(activity);

-- кошки 


create table if not exists cat_breeds (
  id integer primary key autoincrement,
  name text not null,
  size text not null check(size in ('мелкий','средний','крупный')),
  coat text not null,
  cover_type text not null,
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

--  мелкие животные 

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
