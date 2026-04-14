import { useLayoutEffect, useState } from 'react';

// запасная картинка если ни один источник не сработал
const PH =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f5f5f4" width="200" height="200"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Нет фото</text></svg>'
  );

// все файлы из папки assets cats на этапе сборки кладём в объект
const fromAssets = import.meta.glob('../assets/cats/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

// номер в имени файла это id породы чтобы быстро найти url 
const byId = {};
for (const path in fromAssets) {
  const m = path.match(/(\d+)\.(jpg|jpeg|png|webp)$/i);
  if (!m) continue;
  const id = m[1];
  const mod = fromAssets[path];
  const url = mod.default;
  if (url && byId[id] === undefined) {
    byId[id] = url;
  }
}

// порядок попыток сначала vite asset потом public jpg png потом заглушка
function urlsFor(id) {
  if (!id) return [PH];
  const out = [];
  if (byId[id]) out.push(byId[id]);
  out.push('/images/cats/' + id + '.jpg');
  out.push('/images/cats/' + id + '.png');
  out.push(PH);
  return out;
}

export default function CatImage({
  cat,
  className,
  loading = 'lazy',
  fetchPriority,
}) {
  const id = cat && cat.id != null ? String(cat.id) : '';
  const [i, setI] = useState(0);

  const urls = urlsFor(id);
  const src = urls[i];

  // другая кошка начинаем снова с первого url
  useLayoutEffect(() => {
    setI(0);
  }, [id]);

  // on error берём следующий кандидат в списке
  function onBad() {
    if (i < urls.length - 1) {
      setI(i + 1);
    }
  }

  if (!id) {
    return (
      <img
        src={PH}
        alt=""
        className={className}
        loading={loading}
        decoding="async"
      />
    );
  }

  const name = cat && cat.name ? cat.name : '';

  return (
    <img
      src={src}
      alt={name}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={onBad}
    />
  );
}
