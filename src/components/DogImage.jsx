import { useLayoutEffect, useState } from 'react';

// заглушка если нет url или картинка битая
const PH =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f5f5f4" width="200" height="200"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Нет фото</text></svg>'
  );

// путь из базы может быть без ведущего слэша или полный http
function pubUrl(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return t.startsWith('/') ? t : '/' + t;
}

export default function DogImage({
  dog,
  className,
  loading = 'lazy',
  fetchPriority,
}) {
  const src = pubUrl(dog && dog.image_url);
  const [bad, setBad] = useState(false);

  // сменилась порода или картинка сбрасываем флаг ошибки
  useLayoutEffect(() => {
    setBad(false);
  }, [src]);

  if (!src || bad) {
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

  const name = dog && dog.name ? dog.name : '';

  return (
    <img
      src={src}
      alt={name}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => setBad(true)}
    />
  );
}
