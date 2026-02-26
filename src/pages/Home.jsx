import { Link } from 'react-router-dom';
import { Dog, Cat, Rat, Heart, BookOpen, Stethoscope, Sparkles } from 'lucide-react';

export default function Home() {
  const categories = [
    {
      name: 'Собаки',
      text: 'Породы, уход, воспитание и здоровье',
      img: '/images/dog.jpg',
      icon: Dog,
      link: '/dogs',
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
    <>
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            Всё о домашних животных в одном месте
          </h1>
          <p className="text-stone-600 text-lg">
            Проверенная информация по уходу, породам, здоровью и воспитанию собак, кошек и грызунов.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-semibold text-stone-800 mb-6 text-center">Выберите категорию</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md hover:border-teal-200 transition">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
              </div>
              <div className="p-4 flex items-center gap-3">
                <item.icon className="w-6 h-6 text-teal-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-stone-900 group-hover:text-teal-600">{item.name}</h3>
                  <p className="text-sm text-stone-500">{item.text}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
    </>
  );
}
