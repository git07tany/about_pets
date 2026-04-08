import { useLayoutEffect, useState } from 'react';

const PH =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f5f5f4" width="200" height="200"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Нет фото</text></svg>'
  );

const fromAssets = import.meta.glob('../assets/cats/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

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

function urlsFor(id) {
  if (!id) return [PH];
  const out = [];
  if (byId[id]) out.push(byId[id]);
  out.push('/images/cats/' + id + '.jpg');
  out.push('/images/cats/' + id + '.png');
  out.push(PH);
  return out;
}

export default function CatImage({ cat, className }) {
  const id = cat && cat.id != null ? String(cat.id) : '';
  const [i, setI] = useState(0);

  const urls = urlsFor(id);
  const src = urls[i];

  useLayoutEffect(() => {
    setI(0);
  }, [id]);

  function onBad() {
    if (i < urls.length - 1) {
      setI(i + 1);
    }
  }

  if (!id) {
    return <img src={PH} alt="" className={className} />;
  }

  const name = cat && cat.name ? cat.name : '';

  return <img src={src} alt={name} className={className} onError={onBad} />;
}
