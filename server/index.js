import express from 'express';
import cors from 'cors';
import initDb, { query } from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ждём инициализации БД и запускаем сервер
initDb().then((db) => {
  // GET /api/dogs — список пород с поиском и фильтрами
  app.get('/api/dogs', (req, res) => {
    try {
      const { search, size, activity, coat } = req.query;
      let sql = 'SELECT * FROM dog_breeds WHERE 1=1';
      const params = [];

      if (search && search.trim()) {
        sql += ' AND name LIKE ?';
        params.push('%' + search.trim() + '%');
      }
      if (size) {
        sql += ' AND size = ?';
        params.push(size);
      }
      if (activity) {
        sql += ' AND activity = ?';
        params.push(activity);
      }
      if (coat && coat.trim()) {
        sql += ' AND coat LIKE ?';
        params.push('%' + coat.trim() + '%');
      }

      sql += ' ORDER BY name';

      const rows = query(db, sql, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка загрузки данных' });
    }
  });

  // GET /api/dogs/:id — одна порода по id
  app.get('/api/dogs/:id', (req, res) => {
    try {
      const rows = query(db, 'SELECT * FROM dog_breeds WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Порода не найдена' });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка загрузки' });
    }
  });

  // GET /api/dogs/filters — варианты для фильтров
  app.get('/api/dogs/filters', (req, res) => {
    try {
      const rows = query(db, 'SELECT * FROM dog_breeds ORDER BY name');
      const sizes = [...new Set(rows.map(r => r.size))].sort();
      const activities = [...new Set(rows.map(r => r.activity))].sort();
      const coats = [...new Set(rows.map(r => r.coat))].sort();
      res.json({ sizes, activities, coats });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка загрузки фильтров' });
    }
  });

  app.listen(PORT, () => {
    console.log('Сервер запущен на http://localhost:' + PORT);
    console.log('База данных: SQLite (server/db/pets.db)');
  });
}).catch((err) => {
  console.error('Ошибка инициализации БД:', err);
  process.exit(1);
});
