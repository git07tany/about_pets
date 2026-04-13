import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, PawPrint, X } from 'lucide-react';

// общая оболочка сайта шапка подвал и внутри outlet показывает текущую страницу по маршруту
const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/dogs', label: 'Собаки' },
  { to: '/cats', label: 'Кошки' },
  { to: '/rodents', label: 'Грызуны' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // открыто бургер меню блокируем скролл фона на телефоне
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-stone-800 hover:text-teal-600 min-w-0"
            onClick={() => setMobileOpen(false)}
          >
            <PawPrint className="w-7 h-7 shrink-0" />
            <span className="font-semibold text-lg truncate">Питомцы</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Основная навигация">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="text-stone-600 hover:text-teal-600 whitespace-nowrap">
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white p-2.5 text-stone-800 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500 touch-manipulation shrink-0"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-6 h-6" aria-hidden /> : <Menu className="w-6 h-6" aria-hidden />}
          </button>
        </div>
        {mobileOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden border-t border-stone-200 bg-white shadow-lg"
            aria-label="Меню для телефона"
          >
              <ul className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1 text-base">
                {navLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="block rounded-lg px-3 py-3 text-stone-800 hover:bg-teal-50 hover:text-teal-700"
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
        )}
      </header>
      <main>
        {/* сюда подставляется dogs cats home и тд из маршрута */}
        <Outlet />
      </main>
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-stone-500 border-t border-stone-200 mt-auto shrink-0">
        <p>Информационный сайт о домашних животных. Уход, породы, здоровье.</p>
        <p>2026 г.</p>
      </footer>
    </div>
  );
}
