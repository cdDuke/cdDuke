// Text → SVG path helper. GitHub renders README SVGs as <img>, where web fonts
// never load, so brand typography is converted to outlines at build time.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const file = (pkg, name) => require.resolve(`@fontsource/${pkg}/files/${name}`);

const load = (pkg, subset, weight) => {
  const buf = readFileSync(file(pkg, `${pkg}-${subset}-${weight}-normal.woff`));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

const cache = new Map();
function family(pkg, weight) {
  const key = `${pkg}-${weight}`;
  if (!cache.has(key)) cache.set(key, { latin: load(pkg, 'latin', weight), cyrillic: load(pkg, 'cyrillic', weight) });
  return cache.get(key);
}

const isCyrillic = (ch) => /[Ѐ-ӿ]/.test(ch);

/**
 * Lay out a string glyph by glyph (Cyrillic and Latin live in separate font
 * subsets) and return the outline path plus its advance width.
 */
export function textPath(str, { font = 'unbounded', weight = 800, size = 32, x = 0, y = 0, tracking = 0 } = {}) {
  const fam = family(font, weight);
  let cursor = x;
  let d = '';
  let prev = null;
  for (const ch of str) {
    const f = isCyrillic(ch) ? fam.cyrillic : fam.latin;
    let glyph = f.charToGlyph(ch);
    // fall back to the other subset for punctuation that only one of them carries
    if (!glyph || glyph.index === 0) glyph = (f === fam.latin ? fam.cyrillic : fam.latin).charToGlyph(ch);
    const scale = size / f.unitsPerEm;
    if (prev && prev.font === f) cursor += f.getKerningValue(prev.glyph, glyph) * scale;
    d += glyph.getPath(cursor, y, size).toPathData(2);
    cursor += glyph.advanceWidth * scale + tracking;
    prev = { font: f, glyph };
  }
  return { d, width: cursor - x - tracking };
}

export const measure = (str, opts) => textPath(str, opts).width;
