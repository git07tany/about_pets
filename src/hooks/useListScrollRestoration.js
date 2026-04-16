import { useEffect, useRef } from 'react';

// запоминаем скролл списка в session storage и при возврате с карточки крутим окно туда же
// storageKey отдельный для собак кошек грызунов ready когда данные уже подгрузились
export function useListScrollRestoration(storageKey, ready) {
  const pendingY = useRef(null);
  const restored = useRef(false);
  const lastY = useRef(null);

  // прочитать сохранённую позицию при монтировании
  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey);
    if (raw != null && raw !== '') {
      const n = Number(raw);
      if (!Number.isNaN(n)) pendingY.current = n;
    }
  }, [storageKey]);

  // когда список готов один раз восстановить скролл двойной raf чтобы лейаут успел
  useEffect(() => {
    if (!ready || pendingY.current === null || restored.current) return;
    const y = pendingY.current;
    sessionStorage.removeItem(storageKey);
    restored.current = true;
    pendingY.current = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, y));
    });
  }, [ready, storageKey]);

  // пока на странице пишем y в storage при скролле и при уходе сохраняет последнее
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const y = Math.round(window.scrollY);
          lastY.current = y;
          sessionStorage.setItem(storageKey, String(y));
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      //  при навигации браузер может сначала “скроллить наверх”, поэтому нельзя брать window.scrollY прямо в момент размонтирования
      if (lastY.current != null) {
        sessionStorage.setItem(storageKey, String(lastY.current));
      }
    };
  }, [storageKey]);
}
