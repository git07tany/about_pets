import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

// выпадашка фильтра список рисуем порталом в body чтобы не обрезало overflow родителя
export default function FilterDrop({
  menuId,
  openMenu,
  setOpenMenu,
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
}) {
  const open = openMenu === menuId;
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const [box, setBox] = useState({ top: 0, left: 0, width: 0 });

  // позиция списка под кнопкой пересчитываем при скролле окна и ресайзе
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    function move() {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBox({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    move();
    window.addEventListener('scroll', move, true);
    window.addEventListener('resize', move);
    return () => {
      window.removeEventListener('scroll', move, true);
      window.removeEventListener('resize', move);
    };
  }, [open]);

  // клик мимо кнопки и мимо списка закрывает меню
  useEffect(() => {
    if (!open) return;
    function closeIfOutside(e) {
      const t = btnRef.current;
      const m = listRef.current;
      if (t && t.contains(e.target)) return;
      if (m && m.contains(e.target)) return;
      setOpenMenu(null);
    }
    document.addEventListener('mousedown', closeIfOutside);
    return () => document.removeEventListener('mousedown', closeIfOutside);
  }, [open, setOpenMenu]);

  // что показать на кнопке если выбрано ищем label в options иначе сырой value
  let cap = null;
  if (value) {
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === value) {
        cap = options[i].label;
        break;
      }
    }
    if (cap === null) cap = value;
  }

  // сам список в document body координаты fixed из getBoundingClientRect
  const portal =
    open &&
    createPortal(
      <ul
        ref={listRef}
        role="listbox"
        className="fixed z-[200] max-h-56 overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-xl"
        style={{
          top: box.top,
          left: box.left,
          width: Math.max(box.width, 200),
        }}
      >
        <li role="option">
          <button
            type="button"
            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-teal-50 ${!value ? 'bg-stone-50 font-medium text-stone-800' : ''}`}
            onClick={() => {
              onChange('');
              setOpenMenu(null);
            }}
          >
            {placeholder}
          </button>
        </li>
        {options.map((o) => (
          <li key={String(o.value)} role="option">
            <button
              type="button"
              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-teal-50 ${value === o.value ? 'bg-teal-50 font-medium text-teal-900' : ''}`}
              onClick={() => {
                onChange(o.value);
                setOpenMenu(null);
              }}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>,
      document.body
    );

  return (
    <div className="relative min-w-0">
      <span className="block text-sm font-medium text-stone-700 mb-1">{label}</span>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpenMenu(open ? null : menuId);
        }}
        className="w-full px-3 py-2.5 border border-stone-200 rounded-lg bg-white text-left flex items-center justify-between gap-2 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className={cap ? 'text-stone-900 truncate' : 'text-stone-500 truncate'}>
          {cap || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {portal}
    </div>
  );
}
