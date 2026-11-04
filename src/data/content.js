// כל חומר הלימוד של האפליקציה נמצא בקובץ הזה.
// כדי להתאים למבחן אחר: מעדכנים את הרשימות למטה בלבד.
// pic: אימוג'י, או "svg:<שם>" לציור מובנה (ראו src/components/Pic.jsx).

export const TEST_INFO = {
  title: 'משימת הערכה באנגלית',
  dates: 'ב-8 וב-9 בנובמבר',
};

export const LETTERS = [
  { upper: 'A', lower: 'a', word: 'Ant', pic: '🐜', he: 'נמלה' },
  { upper: 'B', lower: 'b', word: 'Bat', pic: '🦇', he: 'עטלף' },
  { upper: 'C', lower: 'c', word: 'Cat', pic: '🐱', he: 'חתול' },
  { upper: 'D', lower: 'd', word: 'Dog', pic: '🐶', he: 'כלב' },
  { upper: 'E', lower: 'e', word: 'Egg', pic: '🥚', he: 'ביצה' },
  { upper: 'F', lower: 'f', word: 'Fan', pic: 'svg:fan', he: 'מאוורר' },
  { upper: 'G', lower: 'g', word: 'Gum', pic: 'svg:gum', he: 'מסטיק' },
  { upper: 'H', lower: 'h', word: 'Hat', pic: '🧢', he: 'כובע' },
  { upper: 'I', lower: 'i', word: 'Ink', pic: 'svg:ink', he: 'דיו' },
  { upper: 'J', lower: 'j', word: 'Jam', pic: 'svg:jam', he: 'ריבה' },
  { upper: 'K', lower: 'k', word: 'Key', pic: '🔑', he: 'מפתח' },
  { upper: 'L', lower: 'l', word: 'Leg', pic: '🦵', he: 'רגל' },
  { upper: 'M', lower: 'm', word: 'Man', pic: '👨', he: 'איש' },
  { upper: 'N', lower: 'n', word: 'Net', pic: '🥅', he: 'רשת' },
  { upper: 'O', lower: 'o', word: 'Ox', pic: '🐂', he: 'שור' },
  { upper: 'P', lower: 'p', word: 'Pen', pic: '🖊️', he: 'עט' },
  { upper: 'Q', lower: 'q', word: 'Quiz', pic: '📝', he: 'חידון' },
  { upper: 'R', lower: 'r', word: 'Run', pic: '🏃', he: 'לרוץ' },
  { upper: 'S', lower: 's', word: 'Sun', pic: '☀️', he: 'שמש' },
  { upper: 'T', lower: 't', word: 'Ten', pic: '🔟', he: 'עשר' },
  { upper: 'U', lower: 'u', word: 'Up', pic: '⬆️', he: 'למעלה' },
  { upper: 'V', lower: 'v', word: 'Van', pic: '🚐', he: 'טנדר' },
  { upper: 'W', lower: 'w', word: 'Web', pic: '🕸️', he: 'קורי עכביש' },
  { upper: 'X', lower: 'x', word: 'X-ray', pic: '🩻', he: 'צילום רנטגן' },
  { upper: 'Y', lower: 'y', word: 'Yes', pic: '✅', he: 'כן' },
  { upper: 'Z', lower: 'z', word: 'Zip', pic: '🤐', he: 'רוכסן' },
];

export const PREPOSITIONS = [
  { word: 'in', he: 'בתוך' },
  { word: 'on', he: 'על' },
  { word: 'under', he: 'מתחת' },
  { word: 'over', he: 'מעל' },
  { word: 'behind', he: 'מאחורי' },
  { word: 'in front of', he: 'מול / לפני' },
  { word: 'next to', he: 'ליד' },
  { word: 'between', he: 'בין' },
];

export const CVC = [
  { word: 'pin', pic: '📌', he: 'סיכה' },
  { word: 'bin', pic: '🗑️', he: 'פח' },
  { word: 'zip', pic: '🤐', he: 'רוכסן' },
  { word: 'bed', pic: '🛏️', he: 'מיטה' },
  { word: 'leg', pic: '🦵', he: 'רגל' },
  { word: 'net', pic: '🥅', he: 'רשת' },
  { word: 'bag', pic: '🎒', he: 'תיק' },
  { word: 'bat', pic: '🦇', he: 'עטלף' },
  { word: 'cat', pic: '🐱', he: 'חתול' },
  { word: 'fox', pic: '🦊', he: 'שועל' },
  { word: 'dog', pic: '🐶', he: 'כלב' },
  { word: 'fog', pic: '🌫️', he: 'ערפל' },
  { word: 'nut', pic: '🥜', he: 'אגוז' },
  { word: 'cut', pic: '✂️', he: 'לחתוך' },
  { word: 'hut', pic: '🛖', he: 'בקתה' },
];

export const NUMBERS = [
  { n: 1, word: 'one', he: 'אחת', pic: '🦆' },
  { n: 2, word: 'two', he: 'שתיים', pic: '🔴' },
  { n: 3, word: 'three', he: 'שלוש', pic: '🎈' },
  { n: 4, word: 'four', he: 'ארבע', pic: '🚗' },
  { n: 5, word: 'five', he: 'חמש', pic: '⭐' },
  { n: 6, word: 'six', he: 'שש', pic: '🌼' },
  { n: 7, word: 'seven', he: 'שבע', pic: '🦋' },
  { n: 8, word: 'eight', he: 'שמונה', pic: '🧱' },
  { n: 9, word: 'nine', he: 'תשע', pic: '🐞' },
  { n: 10, word: 'ten', he: 'עשר', pic: '🌳' },
];

export const COLORS = [
  { word: 'red', he: 'אדום', hex: '#ef4444' },
  { word: 'blue', he: 'כחול', hex: '#3b82f6' },
  { word: 'yellow', he: 'צהוב', hex: '#eab308' },
  { word: 'green', he: 'ירוק', hex: '#22c55e' },
  { word: 'orange', he: 'כתום', hex: '#f97316' },
  { word: 'purple', he: 'סגול', hex: '#a855f7' },
  { word: 'pink', he: 'ורוד', hex: '#ec4899' },
  { word: 'brown', he: 'חום', hex: '#78350f' },
  { word: 'black', he: 'שחור', hex: '#0f172a' },
  { word: 'white', he: 'לבן', hex: '#ffffff' },
  { word: 'gray', he: 'אפור', hex: '#64748b' },
  { word: 'gold', he: 'זהב', hex: 'linear-gradient(135deg,#fde68a,#d4a017 60%,#b8860b)' },
];

export const VOCAB = [
  { word: 'zip', pic: '🤐', he: 'רוכסן' },
  { word: 'queen', pic: '👸', he: 'מלכה' },
  { word: 'run', pic: '🏃', he: 'לרוץ' },
  { word: 'young', pic: '👶', he: 'צעיר' },
  { word: 'mix', pic: '🥣', he: 'לערבב' },
  { word: 'net', pic: '🥅', he: 'רשת' },
  { word: 'umbrella', pic: '☂️', he: 'מטרייה' },
  { word: 'window', pic: '🪟', he: 'חלון' },
  { word: 'dance', pic: '💃', he: 'לרקוד' },
  { word: 'wave', pic: '🌊', he: 'גל' },
  { word: 'sleep', pic: '😴', he: 'לישון' },
  { word: 'ride', pic: '🚲', he: 'לרכוב' },
  { word: 'open', pic: '📖', he: 'פתוח' },
  { word: 'close', pic: '📕', he: 'סגור' },
  { word: 'sing', pic: '🎤', he: 'לשיר' },
  { word: 'fox', pic: '🦊', he: 'שועל' },
  { word: 'duck', pic: '🦆', he: 'ברווז' },
  { word: 'octopus', pic: '🐙', he: 'תמנון' },
  { word: 'ox', pic: '🐂', he: 'שור' },
  { word: 'mouse', pic: '🐭', he: 'עכבר' },
];

export const PRAISE = ['Great job!', 'Well done!', 'Excellent!', 'Super!', 'You got it!'];
export const TRY_AGAIN = 'Try again!';

export const TOPICS = [
  { id: 'letters', he: 'אותיות', icon: '🔤', color: '#f97316' },
  { id: 'prep', he: 'מילות יחס', icon: '📦', color: '#8b5cf6' },
  { id: 'cvc', he: 'קריאה', icon: '📖', color: '#06b6d4' },
  { id: 'numbers', he: 'מספרים', icon: '🔢', color: '#22c55e' },
  { id: 'colors', he: 'צבעים', icon: '🎨', color: '#ec4899' },
  { id: 'vocab', he: 'אוצר מילים', icon: '💬', color: '#3b82f6' },
];

export const EXAM_SIZE = 22;
