import express from 'express';
import cors from 'cors';
import openDb, { runSelect } from './db/connection.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const COATS = ['Короткая', 'Полудлинная', 'Длинная', 'Бесшёрстная'];

const DOG_AGE = [
  { value: '6-8', label: '6-8 лет', min: 6, max: 8 },
  { value: '9-10', label: '9-10 лет', min: 9, max: 10 },
  { value: '10-12', label: '10-12 лет', min: 10, max: 12 },
  { value: '12-14', label: '12-14 лет', min: 12, max: 14 },
  { value: '14-16', label: '14-16 лет', min: 14, max: 16 },
  { value: '16+', label: '16 лет и более', min: 16, max: 30 },
];

function dogAgeOk(row, b) {
  return row.lifespan_max >= b.min && row.lifespan_min <= b.max;
}

function sortWithOrder(vals, order) {
  const bag = new Set(vals);
  const done = new Set();
  const out = [];
  for (let i = 0; i < order.length; i++) {
    const v = order[i];
    if (bag.has(v)) {
      out.push(v);
      done.add(v);
    }
  }
  const rest = [];
  bag.forEach((v) => {
    if (!done.has(v)) rest.push(v);
  });
  rest.sort((a, b) => a.localeCompare(b, 'ru'));
  return out.concat(rest);
}

openDb()
  .then((db) => {
    app.get('/api/dogs', (req, res) => {
      try {
        const size = req.query.size;
        const activity = req.query.activity;
        const coat = req.query.coat;
        const lifespan = req.query.lifespan;
        let sql = 'SELECT * FROM dog_breeds WHERE 1=1';
        const par = [];
        if (size) {
          sql += ' AND size = ?';
          par.push(size);
        }
        if (activity) {
          sql += ' AND activity = ?';
          par.push(activity);
        }
        if (coat && coat.trim()) {
          const ph = COATS.map(() => '?').join(',');
          sql += ` AND (coat = ? OR coat NOT IN (${ph}))`;
          par.push(coat.trim(), ...COATS);
        }
        sql += ' ORDER BY name';
        let rows = runSelect(db, sql, par);
        const key = lifespan && String(lifespan).trim();
        if (key) {
          let b = null;
          for (let i = 0; i < DOG_AGE.length; i++) {
            if (DOG_AGE[i].value === key) {
              b = DOG_AGE[i];
              break;
            }
          }
          if (b) {
            rows = rows.filter((r) => dogAgeOk(r, b));
          }
        }
        res.json(rows);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки данных' });
      }
    });

    app.get('/api/dogs/filters', (req, res) => {
      try {
        const rows = runSelect(db, 'SELECT * FROM dog_breeds ORDER BY name');
        const sizes = ['мелкий', 'средний', 'крупный'];
        const actOrder = ['низкая', 'средняя', 'высокая'];
        const acts = rows.map((r) => r.activity);
        res.json({
          sizes,
          activities: sortWithOrder(acts, actOrder),
          coats: [...COATS],
          lifespanBuckets: DOG_AGE.map((x) => ({ value: x.value, label: x.label })),
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки фильтров' });
      }
    });

    app.get('/api/dogs/:id', (req, res) => {
      try {
        const rows = runSelect(db, 'SELECT * FROM dog_breeds WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Порода не найдена' });
        res.json(rows[0]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки' });
      }
    });

    app.get('/api/cats', (req, res) => {
      try {
        const size = req.query.size;
        const activity = req.query.activity;
        const coat = req.query.coat;
        const minYears = req.query.minYears;
        let sql = 'SELECT * FROM cat_breeds WHERE 1=1';
        const par = [];
        if (size) {
          sql += ' AND size = ?';
          par.push(size);
        }
        if (activity) {
          sql += ' AND activity = ?';
          par.push(activity);
        }
        if (coat && coat.trim()) {
          const ph = COATS.map(() => '?').join(',');
          sql += ` AND (coat = ? OR coat NOT IN (${ph}))`;
          par.push(coat.trim(), ...COATS);
        }
        if (minYears !== undefined && minYears !== '' && !Number.isNaN(Number(minYears))) {
          sql += ' AND lifespan_max >= ?';
          par.push(Number(minYears));
        }
        sql += ' ORDER BY name';
        res.json(runSelect(db, sql, par));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки данных' });
      }
    });

    app.get('/api/cats/filters', (req, res) => {
      try {
        const rows = runSelect(db, 'SELECT * FROM cat_breeds ORDER BY name');
        const sizes = ['мелкий', 'средний', 'крупный'];
        const actOrder = ['низкая', 'средняя', 'высокая'];
        const acts = rows.map((r) => r.activity);
        const years = [...new Set(rows.map((r) => r.lifespan_max))].sort((a, b) => a - b);
        res.json({
          sizes,
          activities: sortWithOrder(acts, actOrder),
          coats: [...COATS],
          minYearsOptions: years,
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки фильтров' });
      }
    });

    app.get('/api/cats/:id', (req, res) => {
      try {
        const rows = runSelect(db, 'SELECT * FROM cat_breeds WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Порода не найдена' });
        res.json(rows[0]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки' });
      }
    });

    app.get('/api/small-pets', (req, res) => {
      try {
        const species = req.query.species && String(req.query.species).trim();
        const care = req.query.care && String(req.query.care).trim();
        let sql = 'SELECT * FROM small_pet_breeds WHERE 1=1';
        const par = [];
        if (species) {
          sql += ' AND species = ?';
          par.push(species);
        }
        if (care) {
          sql += ' AND care_level = ?';
          par.push(care);
        }
        sql += ' ORDER BY species, name';
        res.json(runSelect(db, sql, par));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки данных' });
      }
    });

    app.get('/api/small-pets/:id', (req, res) => {
      try {
        const rows = runSelect(db, 'SELECT * FROM small_pet_breeds WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });
        res.json(rows[0]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка загрузки' });
      }
    });

    app.listen(port, () => {
      console.log('Сервер запущен на http://localhost:' + port);
      console.log('База данных: SQLite (server/db/pets.db)');
    });
  })
  .catch((e) => {
    console.error('Ошибка инициализации БД:', e);
    process.exit(1);
  });
