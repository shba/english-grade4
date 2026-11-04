const SPECIAL = {
  under: 'The cat is under the table.',
  between: 'The cat is between the boxes.',
};

export const sentence = (p) => SPECIAL[p] || `The cat is ${p} the box.`;

export const DRAG_TASKS = [
  { prep: 'next to', en: 'Put the cat next to the box.', he: 'שימו את החתול ליד הקופסה' },
  { prep: 'in', en: 'Put the cat in the box.', he: 'שימו את החתול בתוך הקופסה' },
  { prep: 'between', en: 'Put the cat between the box and the table.', he: 'שימו את החתול בין הקופסה לשולחן' },
  { prep: 'on', en: 'Put the cat on the table.', he: 'שימו את החתול על השולחן' },
  { prep: 'under', en: 'Put the cat under the table.', he: 'שימו את החתול מתחת לשולחן' },
  { prep: 'over', en: 'Put the cat over the box.', he: 'שימו את החתול מעל הקופסה' },
];
