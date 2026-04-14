import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import openDb, { runSelect } from "./db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// на сервере amvera при первом старте копируем pets.db из сборки в папку data чтобы файл не стёрся при деплое
function ensurePersistentDatabaseFile() {
  const persistentDir = "/data";
  const persistentFile = path.join(persistentDir, "pets.db");
  const bundledFile = path.join(__dirname, "db", "pets.db");
  try {
    if (!fs.existsSync(persistentDir)) return;
    if (fs.existsSync(persistentFile)) return;
    if (!fs.existsSync(bundledFile)) {
      console.warn("Нет встроенного файла БД в артефакте:", bundledFile);
      return;
    }
    fs.copyFileSync(bundledFile, persistentFile);
    console.log("База скопирована в постоянное хранилище:", persistentFile);
  } catch (e) {
    console.warn("Не удалось скопировать БД в /data:", e.message);
  }
}

ensurePersistentDatabaseFile();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

const coats = ["Короткая", "Полудлинная", "Длинная", "Бесшёрстная"];

const dogAgeBuckets = [
  { value: "6-8", label: "6-8 лет", min: 6, max: 8 },
  { value: "9-10", label: "9-10 лет", min: 9, max: 10 },
  { value: "10-12", label: "10-12 лет", min: 10, max: 12 },
  { value: "12-14", label: "12-14 лет", min: 12, max: 14 },
  { value: "14-16", label: "14-16 лет", min: 14, max: 16 },
  { value: "16+", label: "16 лет и более", min: 16, max: 30 },
];

// жизнь породы пересекается с выбранным диапазоном лет в фильтре
function dogAgeOk(row, b) {
  return row.lifespan_max >= b.min && row.lifespan_min <= b.max;
}

// сначала значения как в шаблоне потом остальное по алфавиту ru
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
  rest.sort((a, b) => a.localeCompare(b, "ru"));
  return out.concat(rest);
}

openDb()
  .then((db) => {
    app.get("/api/dogs", (req, res) => {
      try {
        const size = req.query.size;
        const activity = req.query.activity;
        const coat = req.query.coat;
        const lifespan = req.query.lifespan;
        // куски sql и плейсхолдеры если в query что то выбрали
        let sql = "select * from dog_breeds where 1=1";
        const par = [];
        if (size) {
          sql += " and size = ?";
          par.push(size);
        }
        if (activity) {
          sql += " and activity = ?";
          par.push(activity);
        }
        if (coat && coat.trim()) {
          // точное совпадение или шерсть не из фиксированного списка в базе бывает другое написание
          const ph = coats.map(() => "?").join(",");
          sql += ` and (coat = ? or coat not in (${ph}))`;
          par.push(coat.trim(), ...coats);
        }
        sql += " order by name";
        let rows = runSelect(db, sql, par);
        const key = lifespan && String(lifespan).trim();
        if (key) {
          let b = null;
          for (let i = 0; i < dogAgeBuckets.length; i++) {
            if (dogAgeBuckets[i].value === key) {
              b = dogAgeBuckets[i];
              break;
            }
          }
          if (b) {
            // отсекаем породы вне выбранной корзины по годам жизни
            rows = rows.filter((r) => dogAgeOk(r, b));
          }
        }
        res.json(rows);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки данных" });
      }
    });

    app.get("/api/dogs/filters", (req, res) => {
      try {
        const rows = runSelect(db, "select * from dog_breeds order by name");
        const sizes = ["мелкий", "средний", "крупный"];
        const actOrder = ["низкая", "средняя", "высокая"];
        const acts = rows.map((r) => r.activity);
        res.json({
          sizes,
          activities: sortWithOrder(acts, actOrder),
          coats: [...coats],
          lifespanBuckets: dogAgeBuckets.map((x) => ({
            value: x.value,
            label: x.label,
          })),
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки фильтров" });
      }
    });

    app.get("/api/dogs/:id", (req, res) => {
      try {
        const rows = runSelect(db, "select * from dog_breeds where id = ?", [
          req.params.id,
        ]);
        if (rows.length === 0)
          return res.status(404).json({ error: "Порода не найдена" });
        res.json(rows[0]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки" });
      }
    });

    app.get("/api/cats", (req, res) => {
      try {
        const size = req.query.size;
        const activity = req.query.activity;
        const coat = req.query.coat;
        const minYears = req.query.minYears;
        let sql = "select * from cat_breeds where 1=1";
        const par = [];
        if (size) {
          sql += " and size = ?";
          par.push(size);
        }
        if (activity) {
          sql += " and activity = ?";
          par.push(activity);
        }
        if (coat && coat.trim()) {
          const ph = coats.map(() => "?").join(",");
          sql += ` and (coat = ? or coat not in (${ph}))`;
          par.push(coat.trim(), ...coats);
        }
        if (
          minYears !== undefined &&
          minYears !== "" &&
          !Number.isNaN(Number(minYears))
        ) {
          // породы у которых верхняя граница жизни не ниже выбранного числа
          sql += " and lifespan_max >= ?";
          par.push(Number(minYears));
        }
        sql += " order by name";
        res.json(runSelect(db, sql, par));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки данных" });
      }
    });

    app.get("/api/cats/filters", (req, res) => {
      try {
        const rows = runSelect(db, "select * from cat_breeds order by name");
        const sizes = ["мелкий", "средний", "крупный"];
        const actOrder = ["низкая", "средняя", "высокая"];
        const acts = rows.map((r) => r.activity);
        // уникальные lifespan_max из данных для фильтра минимального срока
        const years = [...new Set(rows.map((r) => r.lifespan_max))].sort(
          (a, b) => a - b,
        );
        res.json({
          sizes,
          activities: sortWithOrder(acts, actOrder),
          coats: [...coats],
          minYearsOptions: years,
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки фильтров" });
      }
    });

    app.get("/api/cats/:id", (req, res) => {
      try {
        const rows = runSelect(db, "select * from cat_breeds where id = ?", [
          req.params.id,
        ]);
        if (rows.length === 0)
          return res.status(404).json({ error: "Порода не найдена" });
        res.json(rows[0]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки" });
      }
    });

    app.get("/api/small-pets", (req, res) => {
      try {
        const species = req.query.species && String(req.query.species).trim();
        const care = req.query.care && String(req.query.care).trim();
        let sql = "select * from small_pet_breeds where 1=1";
        const par = [];
        if (species) {
          sql += " and species = ?";
          par.push(species);
        }
        if (care) {
          sql += " and care_level = ?";
          par.push(care);
        }
        sql += " order by species, name";
        res.json(runSelect(db, sql, par));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки данных" });
      }
    });

    app.get("/api/small-pets/:id", (req, res) => {
      try {
        const rows = runSelect(
          db,
          "select * from small_pet_breeds where id = ?",
          [req.params.id],
        );
        if (rows.length === 0)
          return res.status(404).json({ error: "Не найдено" });
        res.json(rows[0]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка загрузки" });
      }
    });

    // один процесс отдаёт и api и собранный фронт роуты не api шлём в index html
    const distDir = path.join(__dirname, "..", "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(distDir, "index.html"));
      });
    } else {
      console.log(
        "Папка dist не найдена: отдаётся только API. Соберите фронтенд: npm run build в корне проекта.",
      );
    }

    app.listen(port, "0.0.0.0", () => {
      console.log("Сервер слушает порт", port);
      const dbPath = fs.existsSync("/data/pets.db")
        ? "/data/pets.db"
        : path.join(__dirname, "db", "pets.db");
      console.log("База данных SQLite:", dbPath);
    });
  })
  .catch((e) => {
    console.error("Ошибка инициализации БД:", e);
    process.exit(1);
  });
