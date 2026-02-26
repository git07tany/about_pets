import { useState } from 'react';

// Фото только из папки public/images/dogs/ — имена файлов: 1.jpg, 2.jpg, … 20.jpg
const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f5f5f4" width="200" height="200"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Нет фото</text></svg>');

export default function DogImage({ dog, className }) {
  const id = dog?.id != null ? String(dog.id) : '';
  const [step, setStep] = useState(0); // 0 = jpg, 1 = png, 2 = заглушка

  const src =
    step === 0 ? `/images/dogs/${id}.jpg` :
    step === 1 ? `/images/dogs/${id}.png` :
    PLACEHOLDER;

  const onError = () => setStep((s) => (s < 2 ? s + 1 : s));

  if (!id) return <img src={PLACEHOLDER} alt="" className={className} />;

  return (
    <img
      src={src}
      alt={dog?.name ?? ''}
      className={className}
      onError={onError}
    />
  );
}
