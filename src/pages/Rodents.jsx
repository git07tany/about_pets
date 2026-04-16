import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Search, Rabbit } from "lucide-react";
import SmallPetImage from "../components/SmallPetImage";
import { speciesText, careText } from "../labels";
import { useListScrollRestoration } from "../hooks/useListScrollRestoration";

const apiBase = "/api";

const speciesOptions = [
  { value: "", label: "Кого ищем: все" },
  { value: "хомяк", label: "Хомяки" },
  { value: "крыса", label: "Крысы" },
  { value: "мышь", label: "Мыши" },
  { value: "морская свинка", label: "Морские свинки" },
  { value: "кролик", label: "Кролики" },
];

const careOptions = [
  { value: "", label: "Уход: любой" },
  { value: "лёгкий", label: "Лёгкий уход" },
  { value: "средний", label: "Средний уход" },
  { value: "сложный", label: "Сложный уход" },
];

function norm(s) {
  return String(s || "")
    .normalize("NFC")
    .toLowerCase();
}

export default function Rodents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const q = searchParams.get("q") ?? "";
  const sp = searchParams.get("species") ?? "";
  const cr = searchParams.get("care") ?? "";

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
  const [busy, setBusy] = useState(true);
  const [bad, setBad] = useState(false);

  useListScrollRestoration("pets:scroll:/rodents", !busy);

  const listReturnPath = `${location.pathname}${location.search}`;
  const scrollToCardKey = "pets:scrollToCard:/rodents";

  useEffect(() => {
    setBusy(true);
    setBad(false);
    const p = new URLSearchParams();
    if (sp) p.set("species", sp);
    if (cr) p.set("care", cr);
    const tail = p.toString();
    const url = tail
      ? apiBase + "/small-pets?" + tail
      : apiBase + "/small-pets";
    fetch(url)
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
  }, [sp, cr]);

  let shown = list;
  const qq = q.trim();
  if (qq) {
    const needle = norm(qq);
    shown = list.filter((p) => norm(p.name).includes(needle));
  }

  // чтобы при возврате со страницы детали возвращаться к нужной карточке
  useEffect(() => {
    if (busy) return;
    const pendingId = sessionStorage.getItem(scrollToCardKey);
    if (!pendingId) return;
    const el = document.getElementById(`card-pet-${pendingId}`);
    if (el) el.scrollIntoView({ block: "center" });
    sessionStorage.removeItem(scrollToCardKey);
  }, [busy, shown.length, scrollToCardKey]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
        <Rabbit className="w-8 h-8 text-teal-600" />
        Грызуны и мелкие питомцы
      </h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Поиск по названию..."
            value={q}
            onChange={(e) => patchSearch({ q: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 flex flex-col gap-1 text-sm font-medium text-stone-700">
            Вид животного
            <select
              value={sp}
              onChange={(e) => patchSearch({ species: e.target.value })}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {speciesOptions.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex-1 flex flex-col gap-1 text-sm font-medium text-stone-700">
            Сложность ухода
            <select
              value={cr}
              onChange={(e) => patchSearch({ care: e.target.value })}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {careOptions.map((o) => (
                <option key={o.value || "all-care"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {busy ? (
        <p className="text-stone-500 text-center py-8">Загрузка...</p>
      ) : bad ? (
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          Не удалось загрузить данные. Запустите сервер в папке server (npm
          start) и выполните сид:{" "}
          <code className="text-xs bg-white px-1 rounded">
            npm run seed:small-pets
          </code>
        </p>
      ) : shown.length === 0 ? (
        <p className="text-stone-500 text-center py-8">
          Ничего не найдено. Измените фильтры или поиск.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((pet) => (
            <Link
              key={pet.id}
              to={"/rodents/" + pet.id}
              state={{ listReturn: listReturnPath }}
              id={"card-pet-" + pet.id}
              onClick={() =>
                sessionStorage.setItem(
                  scrollToCardKey,
                  String(pet.id),
                )
              }
              className="group block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition"
            >
              <div className="h-48 sm:h-52 flex items-center justify-center overflow-hidden bg-stone-100">
                <SmallPetImage
                  pet={pet}
                  className="max-w-full max-h-full w-full h-full object-contain group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <h2 className="font-semibold text-stone-900 text-sm sm:text-base group-hover:text-teal-600 line-clamp-2">
                  {pet.name}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {speciesText(pet.species)}
                </p>
                <p className="text-xs text-teal-700 mt-0.5">
                  {careText(pet.care_level)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
