import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Dog } from 'lucide-react';
import DogImage from '../components/DogImage';
import { dogSizeText } from '../labels';

const API = '/api';

export default function DogDetail() {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(API + '/dogs/' + id)
      .then((res) => {
        if (!res.ok) throw new Error('Не найдено');
        return res.json();
      })
      .then((data) => {
        setDog(data);
        setLoading(false);
      })
      .catch(() => {
        setDog(null);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><p className="text-stone-500">Загрузка...</p></div>;
  if (error || !dog) return <div className="max-w-3xl mx-auto px-4 py-8"><p className="text-stone-500">Порода не найдена.</p><Link to="/dogs" className="text-teal-600 hover:underline">← К списку</Link></div>;

  const nutritionText =
    dog.nutrition && String(dog.nutrition).trim()
      ? dog.nutrition
      : 'Корм по возрасту и размеру породы, вода всегда. Со стола не кормить как основой. Опасно (не рекомендуется): шоколад, ксилитол, виноград/изюм, лук/чеснок, макадамии, алкоголь. Болезни: только по совету ветеринара.';

  const blocks = [
    { title: 'Шерсть', text: dog.coat },
    { title: 'Характер', text: dog.character_traits },
    {
      title: 'Срок жизни',
      text: `В среднем для этой породы указывают около ${dog.lifespan_min}-${dog.lifespan_max} лет. Реальный срок зависит от линии разведения, генетики, кормления, профилактики и условий содержания.`,
    },
    { title: 'Активность', text: dog.activity },
    { title: 'Кормление', text: nutritionText },
    { title: 'Уход', text: dog.care },
    { title: 'Здоровье и возможные проблемы', text: dog.health },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/dogs" className="inline-flex items-center gap-1 text-stone-600 hover:text-teal-600 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        К списку пород
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="h-56 sm:h-72 flex items-center justify-center overflow-hidden bg-stone-100">
          <DogImage dog={dog} className="max-w-full max-h-full w-full h-full object-contain" />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2 mb-1">
            <Dog className="w-7 h-7 text-teal-600" />
            {dog.name}
          </h1>
          <p className="text-stone-500 mb-8">Размер: {dogSizeText(dog.size)}</p>

          <div className="space-y-6">
            {blocks.map((block) => (
              <section key={block.title} className="border-b border-stone-100 pb-6 last:border-0 last:pb-0">
                <h2 className="text-lg font-semibold text-stone-800 mb-2">{block.title}</h2>
                <p className="text-stone-600 text-[15px] leading-relaxed">{block.text}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
