import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Search, Filter, Cat, X } from "lucide-react";
import CatImage from "../components/CatImage";
import FilterDrop from "../components/FilterDrop";
import { useListScrollRestoration } from "../hooks/useListScrollRestoration";

const apiBase = "/api";

const defSizes = ["мелкий", "средний", "крупный"];
const defActs = ["низкая", "средняя", "высокая"];
const defCoats = ["короткая", "полудлинная", "длинная", "бесшёрстная"];

function norm(s) {
  return String(s || "")
    .normalize("NFC")
    .toLowerCase();
}

export default function Cats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const q = searchParams.get("q") ?? "";
  const sz = searchParams.get("size") ?? "";
  const act = searchParams.get("activity") ?? "";
  const coat = searchParams.get("coat") ?? "";
  const years = searchParams.get("minYears") ?? "";

  const patchSearch = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          for (const [key, val] of Object.entries(updates)) {
            const s = val == null ? "" : String(val);
            if (!s.trim()) p.delete(key);
            else p.set(key, s.trim());
          }
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({
    sizes: [],
    activities: [],
    coats: [],
    minYearsOptions: [],
  });
  const [busy, setBusy] = useState(true);
  const [panel, setPanel] = useState(false);
  const [menu, setMenu] = useState(null);
  const [bad, setBad] = useState(false);
  const [metaBusy, setMetaBusy] = useState(true);
  const [metaBad, setMetaBad] = useState(false);

  useListScrollRestoration("pets:scroll:/cats", !busy);

  const listReturnPath = `${location.pathname}${location.search}`;
  const scrollToCardKey = "pets:scrollToCard:/cats";
  const returnPathKey = "pets:returnPath:/cats";

  const szList = meta.sizes.length > 0 ? meta.sizes : defSizes;
  const sizeOpts = szList.map((s) => ({ value: s, label: s }));

  const actList = meta.activities.length > 0 ? meta.activities : defActs;
  const actOpts = actList.map((a) => ({ value: a, label: a }));

  const coatList = meta.coats.length > 0 ? meta.coats : defCoats;
  const coatOpts = coatList.map((c) => ({ value: c, label: c }));

  const yearsOpts = (meta.minYearsOptions || []).map((y) => ({
    value: String(y),
    label: `${y} лет и выше`,
  }));

  useEffect(() => {
    setMetaBusy(true);
    setMetaBad(false);
    fetch(apiBase + "/cats/filters")
      .then((res) => {
        if (!res.ok) throw new Error("x");
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setMeta({
            sizes: data.sizes || [],
            activities: data.activities || [],
            coats: data.coats || [],
            minYearsOptions: data.minYearsOptions || [],
          });
        } else {
          setMetaBad(true);
        }
      })
      .catch(() => {
        setMetaBad(true);
        setMeta({
          sizes: [],
          activities: [],
          coats: [],
          minYearsOptions: [],
        });
      })
      .finally(() => setMetaBusy(false));
  }, []);

  useEffect(() => {
    setBusy(true);
    const p = new URLSearchParams();
    if (sz) p.set("size", sz);
    if (act) p.set("activity", act);
    if (coat.trim()) p.set("coat", coat.trim());
    if (years) p.set("minYears", years);
    setBad(false);
    fetch(apiBase + "/cats?" + p.toString())
      .then((res) => res.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
        setBusy(false);
      })
      .catch(() => {
        setList([]);
        setBad(true);
        setBusy(false);
      });
  }, [sz, act, coat, years]);

  let shown = list;
  const qq = q.trim();
  if (qq) {
    const needle = norm(qq);
    shown = list.filter((d) => norm(d.name).includes(needle));
  }

  // чтобы при возврате со страницы детали возвращаться к нужной карточке
  useEffect(() => {
    if (busy) return;
    const pendingId = sessionStorage.getItem(scrollToCardKey);
    if (!pendingId) return;
    const el = document.getElementById(`card-cat-${pendingId}`);
    if (el) el.scrollIntoView({ block: "center" });
    sessionStorage.removeItem(scrollToCardKey);
  }, [busy, shown.length, scrollToCardKey]);

  let nActive = 0;
  if (sz) nActive++;
  if (act) nActive++;
  if (coat.trim()) nActive++;
  if (years) nActive++;

  function reset() {
    patchSearch({
      size: "",
      activity: "",
      coat: "",
      minYears: "",
    });
  }

  const emptySearch = !busy && !bad && list.length > 0 && shown.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
        <Cat className="w-8 h-8 text-teal-600" />
        Породы кошек
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Начните вводить название породы кошки..."
            value={q}
            onChange={(e) => patchSearch({ q: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            aria-label="Поиск по названию породы кошки"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setMenu(null);
            setPanel(!panel);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl bg-white hover:bg-stone-50 shrink-0"
        >
          <Filter className="w-5 h-5" />
          Характеристики
          {nActive > 0 && (
            <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-teal-600 text-white text-xs font-semibold flex items-center justify-center">
              {nActive}
            </span>
          )}
        </button>
      </div>

      {panel && (
        <div className="p-4 bg-white border border-stone-200 rounded-xl mb-6 space-y-4 overflow-visible">
          {metaBusy && (
            <p className="text-sm text-stone-600">
              Загрузка вариантов фильтров…
            </p>
          )}
          {metaBad && !metaBusy && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Не удалось получить список вариантов с сервера. Проверьте, что
              запущен backend (папка server,{" "}
              <code className="text-xs bg-amber-100/80 px-1 rounded">
                npm start
              </code>
              ). Размер и активность доступны для выбора; шерсть и срок жизни
              появятся после успешной загрузки.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible min-w-0">
            <FilterDrop
              menuId="size"
              openMenu={menu}
              setOpenMenu={setMenu}
              label="Размер"
              value={sz}
              placeholder="Все размеры"
              options={sizeOpts}
              onChange={(v) => patchSearch({ size: v })}
              disabled={false}
            />
            <FilterDrop
              menuId="activity"
              openMenu={menu}
              setOpenMenu={setMenu}
              label="Активность"
              value={act}
              placeholder="Любая активность"
              options={actOpts}
              onChange={(v) => patchSearch({ activity: v })}
              disabled={false}
            />
            <FilterDrop
              menuId="coat"
              openMenu={menu}
              setOpenMenu={setMenu}
              label="Тип шерсти"
              value={coat}
              placeholder={coatOpts.length ? "Все типы" : "Нет данных из БД"}
              options={coatOpts}
              onChange={(v) => patchSearch({ coat: v })}
              disabled={!coatOpts.length}
            />
            <FilterDrop
              menuId="lifespan"
              openMenu={menu}
              setOpenMenu={setMenu}
              label="Срок жизни (не менее)"
              value={years}
              placeholder={yearsOpts.length ? "Любой срок" : "Нет данных из БД"}
              options={yearsOpts}
              onChange={(v) => patchSearch({ minYears: v })}
              disabled={!yearsOpts.length}
            />
          </div>
          {nActive > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 font-medium"
            >
              <X className="w-4 h-4" />
              Сбросить характеристики
            </button>
          )}
        </div>
      )}

      {busy ? (
        <p className="text-stone-500 text-center py-8">Загрузка...</p>
      ) : bad ? (
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          Не удалось загрузить данные. Убедись, что запущен сервер (из папки
          server: npm start).
        </p>
      ) : shown.length === 0 ? (
        <p className="text-stone-500 text-center py-8">
          {emptySearch
            ? "По названию ничего не найдено. Измените запрос или сбросьте фильтры."
            : "Ни одной породы не найдено. Измените фильтры по характеристикам."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((cat) => (
            <Link
              key={cat.id}
              to={"/cats/" + cat.id}
              state={{ listReturn: listReturnPath }}
              id={"card-cat-" + cat.id}
              onClick={() =>
                (() => {
                  sessionStorage.setItem(scrollToCardKey, String(cat.id));
                  sessionStorage.setItem(returnPathKey, listReturnPath);
                })()
              }
              className="group block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition"
            >
              <div className="h-52 sm:h-56 flex items-center justify-center overflow-hidden bg-stone-100">
                <CatImage
                  key={cat.id}
                  cat={cat}
                  className="max-w-full max-h-full w-full h-full object-contain group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-stone-900 group-hover:text-teal-600">
                  {cat.name}
                </h3>
                <p className="text-sm text-stone-500">{cat.size}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
