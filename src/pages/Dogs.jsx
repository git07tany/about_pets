import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Dog } from 'lucide-react';
import DogImage from '../components/DogImage';

const API = '/api';

export default function Dogs() {
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState({ sizes: [], activities: [], coats: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [coatFilter, setCoatFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(API + '/dogs/filters')
      .then((res) => res.json())
      .then((data) => setFilters(data))
      .catch(() => setFilters({ sizes: [], activities: [], coats: [] }));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (sizeFilter) params.set('size', sizeFilter);
    if (activityFilter) params.set('activity', activityFilter);
    if (coatFilter.trim()) params.set('coat', coatFilter.trim());
    setError(false);
    fetch(API + '/dogs?' + params.toString())
      .then((res) => res.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setList([]);
        setError(true);
        setLoading(false);
      });
  }, [search, sizeFilter, activityFilter, coatFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
        <Dog className="w-8 h-8 text-teal-600" />
        Породы собак
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Поиск по названию породы..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl bg-white hover:bg-stone-50"
        >
          <Filter className="w-5 h-5" />
          Фильтр
        </button>
      </div>

      {showFilter && (
        <div className="p-4 bg-white border border-stone-200 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Размер</label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg"
            >
              <option value="">Все</option>
              {filters.sizes?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Активность</label>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg"
            >
              <option value="">Все</option>
              {filters.activities?.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Тип шерсти</label>
            <select
              value={coatFilter}
              onChange={(e) => setCoatFilter(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg"
            >
              <option value="">Все</option>
              {filters.coats?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-stone-500 text-center py-8">Загрузка...</p>
      ) : error ? (
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          Не удалось загрузить данные. Убедись, что запущен сервер (из папки server: npm start).
        </p>
      ) : list.length === 0 ? (
        <p className="text-stone-500 text-center py-8">Ни одной породы не найдено. Измените поиск или фильтры.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((dog) => (
            <Link
              key={dog.id}
              to={'/dogs/' + dog.id}
              className="group block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition">
              <div className="h-52 sm:h-56 flex items-center justify-center overflow-hidden bg-stone-100">
                <DogImage
                  key={dog.id}
                  dog={dog}
                  className="max-w-full max-h-full w-full h-full object-contain group-hover:scale-105 transition duration-300"/>
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-stone-900 group-hover:text-teal-600">{dog.name}</h3>
                <p className="text-sm text-stone-500">{dog.size}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
