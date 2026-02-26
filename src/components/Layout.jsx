import { Link, Outlet } from 'react-router-dom';
import { PawPrint } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-stone-800 hover:text-teal-600">
            <PawPrint className="w-7 h-7" />
            <span className="font-semibold text-lg">Питомцы</span>
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/" className="text-stone-600 hover:text-teal-600">Главная</Link>
            <Link to="/dogs" className="text-stone-600 hover:text-teal-600">Собаки</Link>
            <a href="#" className="text-stone-600 hover:text-teal-600">Уход</a>
            <a href="#" className="text-stone-600 hover:text-teal-600">Здоровье</a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-stone-500 border-t border-stone-200 mt-auto">
        <p>Информационный сайт о домашних животных. Уход, породы, здоровье.</p>
      </footer>
    </div>
  );
}
