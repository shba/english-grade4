// Prints every English phrase the app speaks, one per line, as "slug<TAB>text".
import { allPhrases } from '../src/lib/questions.js';
import { PRAISE, TRY_AGAIN } from '../src/data/content.js';
import { DRAG_TASKS } from '../src/lib/sentences.js';
import { LETTERS } from '../src/data/content.js';

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const extra = [...PRAISE, TRY_AGAIN, 'Hello! Umbrella.', ...DRAG_TASKS.map((t) => t.en), ...LETTERS.map((l) => l.word)];
for (const p of allPhrases(extra)) console.log(`${slug(p)}\t${p}`);
