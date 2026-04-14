import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Cat } from "lucide-react";
import CatImage from "../components/CatImage";

const apiBase = "/api";

export default function CatDetail() {
  const { id } = useParams();
  const location = useLocation();
  const listBack =
    typeof location.state?.listReturn === "string"
      ? location.state.listReturn
      : "/cats";
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(apiBase + "/cats/" + id)
      .then((res) => {
        if (!res.ok) throw new Error("Не найдено");
        return res.json();
      })
      .then((data) => {
        setCat(data);
        setLoading(false);
      })
      .catch(() => {
        setCat(null);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-stone-500">Загрузка...</p>
      </div>
    );
  if (error || !cat)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-stone-500">Порода не найдена.</p>
        <Link to={listBack} className="text-teal-600 hover:underline">
          ← К списку
        </Link>
      </div>
    );

  const blocks = [
    {
      title: "Шерсть и тип покрова",
      text: null,
      coatBlock: true,
    },
    { title: "Характер", text: cat.character_traits },
    {
      title: "Продолжительность жизни",
      text: `В среднем около ${cat.lifespan_min}-${cat.lifespan_max} лет`,
    },
    { title: "Активность", text: cat.activity },
    { title: "Питание", text: cat.nutrition },
    { title: "Уход и содержание", text: cat.care },
    { title: "Здоровье и предрасположенности", text: cat.health },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to={listBack}
        className="inline-flex items-center gap-1 text-stone-600 hover:text-teal-600 text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />К списку пород
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="h-56 sm:h-72 flex items-center justify-center overflow-hidden bg-stone-100">
          <CatImage
            cat={cat}
            loading="eager"
            fetchPriority="high"
            className="max-w-full max-h-full w-full h-full object-contain"
          />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2 mb-1">
            <Cat className="w-7 h-7 text-teal-600" />
            {cat.name}
          </h1>
          <p className="text-stone-500 mb-8">Размер: {cat.size}</p>

          <div className="space-y-6">
            {blocks.map((block) => (
              <section
                key={block.title}
                className="border-b border-stone-100 pb-6 last:border-0 last:pb-0"
              >
                <h2 className="text-lg font-semibold text-stone-800 mb-2">
                  {block.title}
                </h2>
                {block.coatBlock ? (
                  <div className="text-stone-600 text-[15px] leading-relaxed space-y-3">
                    <p>
                      <span className="font-medium text-stone-700">
                        Шерсть:{" "}
                      </span>
                      {cat.coat}
                    </p>
                    <p>
                      <span className="font-medium text-stone-700">
                        Тип покрова:{" "}
                      </span>
                      {cat.cover_type || "-"}
                    </p>
                  </div>
                ) : (
                  <p className="text-stone-600 text-[15px] leading-relaxed">
                    {block.text}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
