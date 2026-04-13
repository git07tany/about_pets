import { useLayoutEffect, useState } from 'react';

// svg data url когда фото нет или не грузится
const PH =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f5f5f4" width="200" height="200"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Нет фото</text></svg>'
  );

// как у собак нормализуем путь к public или внешний url
function pubUrl(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return t.startsWith('/') ? t : '/' + t;
}

export default function SmallPetImage({ pet, className }) {
  const src = pubUrl(pet && pet.image_url);
  const [bad, setBad] = useState(false);

  // новый src сбрасываем ошибку загрузки
  useLayoutEffect(() => {
    setBad(false);
  }, [src]);

  if (!src || bad) {
    return <img src={PH} alt="" className={className} />;
  }

  const name = pet && pet.name ? pet.name : '';

  return (
    <img src={src} alt={name} className={className} onError={() => setBad(true)} />
  );
}
