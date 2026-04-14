import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Rabbit } from "lucide-react";
import SmallPetImage from "../components/SmallPetImage";
import { careText } from "../labels";

const apiBase = "/api";

export default function RodentDetail() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(apiBase + "/small-pets/" + id)
      .then((res) => {
        if (!res.ok) throw new Error("нет");
        return res.json();
      })
      .then((data) => {
        setPet(data);
        setLoading(false);
      })
      .catch(() => {
        setPet(null);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-stone-500">Загрузка...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-stone-500">Карточка не найдена.</p>
        <Link to="/rodents" className="text-teal-600 hover:underline">
          Назад к списку
        </Link>
      </div>
    );
  }

  const blocks = [
    {
      title: "Срок жизни",
      text: `Обычно около ${pet.lifespan_min}-${pet.lifespan_max} лет (оценка для домашнего содержания; многое зависит от корма, стресса и ветеринарии).`,
    },
    { title: "Питание", text: pet.nutrition },
    { title: "Уход и содержание", text: pet.care },
    { title: "Здоровье и типичные проблемы", text: pet.health },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/rodents"
        className="inline-flex items-center gap-1 text-stone-600 hover:text-teal-600 text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />К списку
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="h-56 sm:h-64 flex items-center justify-center overflow-hidden bg-stone-100">
          <SmallPetImage
            pet={pet}
            className="max-w-full max-h-full w-full h-full object-contain"
          />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2 mb-2">
            <Rabbit className="w-7 h-7 text-teal-600" />
            {pet.name}
          </h1>
          <p className="text-stone-600 mb-8">
            Уход:{" "}
            <span className="font-medium text-stone-800">
              {careText(pet.care_level)}
            </span>
          </p>

          <div className="space-y-6">
            {blocks.map((b) => (
              <section
                key={b.title}
                className="border-b border-stone-100 pb-6 last:border-0 last:pb-0"
              >
                <h2 className="text-lg font-semibold text-stone-800 mb-2">
                  {b.title}
                </h2>
                <p className="text-stone-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {b.text}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
