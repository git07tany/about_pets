export function dogSizeText(size) {
  const t = {
    мелкий: 'мелкий (до 10 кг)',
    средний: 'средний (11-25 кг)',
    крупный: 'крупный (26 кг и более)',
  };
  return t[size] || size;
}

export function speciesText(species) {
  const t = {
    хомяк: 'Хомяк',
    крыса: 'Крыса',
    мышь: 'Мышь',
    'морская свинка': 'Морская свинка',
    кролик: 'Кролик',
  };
  return t[species] || species;
}

export function careText(level) {
  const t = {
    лёгкий: 'Лёгкий уход',
    средний: 'Средний уход',
    сложный: 'Сложный уход',
  };
  return t[level] || level;
}
