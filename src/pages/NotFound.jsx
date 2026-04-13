import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-6xl font-bold text-stone-300 mb-2">404</p>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Страница не найдена</h1>
      <p className="text-stone-600 mb-8">
        Такого адреса на сайте нет. Проверьте ссылку или вернитесь на главную.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-3 text-sm font-medium hover:bg-teal-700 transition"
      >
        <Home className="w-4 h-4" />
        На главную
      </Link>
    </div>
  );
}
