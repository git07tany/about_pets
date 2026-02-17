import { PawPrint, Dog, Cat, Rat, Heart, BookOpen, Stethoscope, Sparkles } from 'lucide-react';

function App() {
  const categories = [
    {
      name: 'Собаки',
      text: 'Породы, уход, воспитание и здоровье',
      img: '/images/dog.jpg',
      icon: Dog,
      link: '#',
    },
    {
      name: 'Кошки',
      text: 'Породы, уход, питание и здоровье',
      img: '/images/cat.jpg',
      icon: Cat,
      link: '#',
    },
    {
      name: 'Грызуны',
      text: 'Хомяки, морские свинки, кролики и уход',
      img: '/images/rabbit.jpg',
      icon: Rat,
      link: '#',
    },
  ];

  const blocks = [
    { icon: BookOpen, title: 'Породы', desc: 'Сравнение пород, характер, размер' },
    { icon: Heart, title: 'Уход', desc: 'Кормление, гигиена, обустройство' },
    { icon: Stethoscope, title: 'Здоровье', desc: 'Болезни, прививки, симптомы' },
    { icon: Sparkles, title: 'Поведение', desc: 'Дрессировка и коррекция поведения' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* шапка */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-stone-800 hover:text-teal-600">
            <PawPrint className="w-7 h-7" />
            <span className="font-semibold text-lg">Питомцы</span>
          </a>
          <nav className="flex gap-6 text-sm">
            <a href="#" className="text-stone-600 hover:text-teal-600">Главная</a>
            <a href="#" className="text-stone-600 hover:text-teal-600">Породы</a>
            <a href="#" className="text-stone-600 hover:text-teal-600">Уход</a>
            <a href="#" className="text-stone-600 hover:text-teal-600">Здоровье</a>
          </nav>
        </div>
      </header>

      <main>
        {/* главный блок */}
        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Всё о домашних животных в одном месте
            </h1>
            <p className="text-stone-600 text-lg">
              Проверенная информация по уходу, породам, здоровью и воспитанию собак, кошек и грызунов. Для новичков и опытных владельцев.
            </p>
          </div>
        </section>

        {/* категории */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-semibold text-stone-800 mb-6 text-center">Выберите категорию</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md hover:border-teal-200 transition"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 flex items-center gap-3">
                  <item.icon className="w-6 h-6 text-teal-600 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-stone-900 group-hover:text-teal-600">{item.name}</h3>
                    <p className="text-sm text-stone-500">{item.text}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* что есть на сайте */}
        <section className="bg-white border-y border-stone-200 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-semibold text-stone-800 mb-8 text-center">Что вы найдёте на сайте</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {blocks.map((item) => (
                <div key={item.title} className="text-center p-4">
                  <div className="inline-flex p-3 rounded-xl bg-teal-50 text-teal-600 mb-3">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* подвал */}
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-stone-500 border-t border-stone-200">
        <p>Информационный сайт о домашних животных. Уход, породы, здоровье.</p>
      </footer>
    </div>
  );
}

export default App;
