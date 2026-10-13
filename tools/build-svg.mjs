// Builds the animated SVGs used in the profile README:
// banner (orbiting tech stack), terminal (typed commands), divider and stats.
// Only CSS and SMIL animations are used — GitHub strips scripts from images.
import { readFileSync, writeFileSync } from 'node:fs';
import { textPath, measure } from './text.mjs';

const OUT = new URL('../assets/', import.meta.url);
const projects = JSON.parse(readFileSync(new URL('./projects.json', import.meta.url), 'utf8'));
const N = {
  total: projects.length,
  demos: projects.filter((p) => p.kind !== 'bot').length,
  bots: projects.filter((p) => p.kind === 'bot').length,
};
const plural = (n, one, few, many) => {
  const m10 = n % 10;
  const m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};
const C = { bg: '#0b0b10', panel: '#12121a', fg: '#f3f1ec', muted: '#9a98a6', dim: '#5d5b6b', lime: '#d7ff3d', mint: '#7dffcf', violet: '#8b6cff', pink: '#ff5c93', line: '#ffffff14' };
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

// deterministic pseudo-random numbers so rebuilding gives the same picture
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const save = (name, svg) => {
  writeFileSync(new URL(name, OUT), svg.replace(/\n\s*\n/g, '\n'));
  console.log('wrote', name, (svg.length / 1024).toFixed(1) + ' KB');
};

/* ------------------------------------------------------------------ banner */
function banner() {
  const W = 1280;
  const H = 420;
  const L = 72; // left padding

  // status chip
  const chipText = 'Открыт к работе · Open to work';
  const chipT = textPath(chipText, { font: 'manrope', weight: 700, size: 16, x: L + 38, y: 81 });
  const chipW = chipT.width + 58;

  // wordmark — fit to 600px
  let size = 128;
  const wmWidth = (s) => measure('cdDuke.', { size: s, tracking: -s * 0.04 });
  while (wmWidth(size) > 600) size -= 2;
  const word = textPath('cdDuke', { size, x: L - 4, y: 214, tracking: -size * 0.04 });
  const dot = textPath('.', { size, x: L - 4 + word.width - size * 0.04, y: 214 });
  const wmW = wmWidth(size);

  // rotating roles
  const roles = ['Frontend-разработчик', 'Анимации · 3D · WebGL', 'Telegram-боты на Python'];
  let rs = 34;
  while (Math.max(...roles.map((r) => measure(r, { weight: 700, size: rs }))) > 640) rs -= 1;
  const roleSvg = roles
    .map((r, i) => `<g class="role" style="animation-delay:${i * 4}s"><path d="${textPath(r, { weight: 700, size: rs, x: L, y: 292 }).d}" fill="url(#brand)"/></g>`)
    .join('');

  const desc = textPath('React · TypeScript · GSAP · Three.js · Python · aiogram', { font: 'manrope', weight: 500, size: 19, x: L, y: 338 });
  const site = textPath('cdduke.github.io', { font: 'manrope', weight: 700, size: 17, x: L + 22, y: 382 });

  // orbit system
  const cx = 1010;
  const cy = 212;
  const orbits = [
    { rx: 206, ry: 68, rot: -16, dur: 18, color: C.violet, labels: ['React', 'Three.js'] },
    { rx: 152, ry: 50, rot: 24, dur: 13, color: C.mint, labels: ['TypeScript', 'GSAP'] },
    { rx: 104, ry: 34, rot: -50, dur: 9, color: C.lime, labels: ['Python', 'aiogram'] },
  ];
  const chip = (label, color, rot) => {
    const t = textPath(label, { font: 'manrope', weight: 700, size: 14, x: 0, y: 0 });
    const w = t.width + 30;
    return `<g transform="rotate(${-rot})"><rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" fill="#15151f" stroke="${color}" stroke-opacity=".7"/>
      <circle cx="${-w / 2 + 13}" cy="0" r="3.5" fill="${color}"/>
      <path transform="translate(${-w / 2 + 22} 5)" d="${t.d}" fill="${C.fg}"/></g>`;
  };
  const orbitSvg = orbits
    .map((o, i) => {
      const id = `orb${i}`;
      const d = `M${cx - o.rx},${cy} a${o.rx},${o.ry} 0 1,0 ${o.rx * 2},0 a${o.rx},${o.ry} 0 1,0 ${-o.rx * 2},0`;
      const sats = o.labels
        .map(
          (lab, k) => `<g><animateMotion dur="${o.dur}s" begin="${(-o.dur * k) / o.labels.length - i}s" repeatCount="indefinite"><mpath href="#${id}"/></animateMotion>${chip(lab, o.color, o.rot)}</g>`
        )
        .join('');
      return `<g transform="rotate(${o.rot} ${cx} ${cy})"><path id="${id}" d="${d}" fill="none" stroke="${o.color}" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="3 7"/>${sats}</g>`;
    })
    .join('');
  const code = textPath('</>', { weight: 700, size: 26, x: 0, y: 0 });

  const stars = Array.from({ length: 34 }, () => {
    const x = 700 + rnd() * 560;
    const y = 30 + rnd() * 360;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.6 + rnd() * 1.4).toFixed(2)}" class="star" style="animation-delay:${(-rnd() * 4).toFixed(2)}s;animation-duration:${(2.5 + rnd() * 3).toFixed(2)}s"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="cdDuke — frontend developer: animations, 3D/WebGL and Telegram bots">
<style>
  .glow { animation: breathe 7s ease-in-out infinite; }
  .glow2 { animation: breathe 9s ease-in-out infinite reverse; }
  @keyframes breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
  .role { opacity: 0; transform-box: fill-box; animation: role 12s infinite; }
  @keyframes role { 0% { opacity: 0; transform: translateY(16px) } 4%, 29% { opacity: 1; transform: none } 33%, 100% { opacity: 0; transform: translateY(-16px) } }
  .star { fill: #fff; animation: twinkle 3s ease-in-out infinite; }
  @keyframes twinkle { 0%,100% { opacity: .15 } 50% { opacity: .9 } }
  .spin { transform-box: fill-box; transform-origin: center; animation: spin 24s linear infinite; }
  .spin-r { transform-box: fill-box; transform-origin: center; animation: spin 36s linear infinite reverse; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .caret { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="26"/></clipPath>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity=".045"/></pattern>
  <radialGradient id="fade" cx="78%" cy="40%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <radialGradient id="gViolet"><stop offset="0" stop-color="${C.violet}" stop-opacity=".55"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gLime"><stop offset="0" stop-color="${C.lime}" stop-opacity=".22"/><stop offset="1" stop-color="${C.lime}" stop-opacity="0"/></radialGradient>
  <radialGradient id="core" cx="35%" cy="30%"><stop offset="0" stop-color="#b8a6ff"/><stop offset=".55" stop-color="${C.violet}"/><stop offset="1" stop-color="#2a1f5c"/></radialGradient>
  <linearGradient id="brand" x1="0" x2="640" y1="0" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
    <stop offset="0" stop-color="${C.lime}"/><stop offset=".5" stop-color="${C.mint}"/><stop offset="1" stop-color="${C.violet}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;640 0;0 0" dur="10s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${C.lime}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  <circle class="glow" cx="1060" cy="120" r="330" fill="url(#gViolet)"/>
  <circle class="glow2" cx="160" cy="430" r="320" fill="url(#gLime)"/>
  ${stars}

  <!-- left: identity -->
  <rect x="${L}" y="58" width="${chipW}" height="36" rx="18" fill="#ffffff08" stroke="#ffffff22"/>
  <circle cx="${L + 20}" cy="76" r="5" fill="${C.lime}"/>
  <circle cx="${L + 20}" cy="76" r="5" fill="none" stroke="${C.lime}"><animate attributeName="r" values="5;14" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="1.8s" repeatCount="indefinite"/></circle>
  <path d="${chipT.d}" fill="${C.fg}" fill-opacity=".86"/>
  <path d="${word.d}" fill="${C.fg}"/>
  <path d="${dot.d}" fill="${C.lime}"/>
  <rect x="${L}" y="236" height="4" rx="2" fill="url(#bar)" width="0"><animate attributeName="width" values="0;${wmW.toFixed(0)};${wmW.toFixed(0)};0" keyTimes="0;.25;.85;1" dur="6s" repeatCount="indefinite"/></rect>
  ${roleSvg}
  <path d="${desc.d}" fill="${C.muted}"/>
  <path d="M${L} 376h12m-5-5 5 5-5 5" fill="none" stroke="${C.lime}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${site.d}" fill="${C.lime}"/>
  <rect class="caret" x="${L + 26 + site.width}" y="366" width="9" height="20" fill="${C.lime}"/>

  <!-- right: orbiting stack -->
  <circle class="glow" cx="${cx}" cy="${cy}" r="150" fill="url(#gViolet)"/>
  <circle class="spin" cx="${cx}" cy="${cy}" r="70" fill="none" stroke="${C.violet}" stroke-opacity=".5" stroke-dasharray="2 10" stroke-width="2"/>
  <circle class="spin-r" cx="${cx}" cy="${cy}" r="84" fill="none" stroke="${C.mint}" stroke-opacity=".25" stroke-dasharray="40 14 4 14"/>
  <circle cx="${cx}" cy="${cy}" r="52" fill="url(#core)"/>
  <circle cx="${cx}" cy="${cy}" r="52" fill="none" stroke="#ffffff" stroke-opacity=".25"/>
  <path transform="translate(${cx - 30} ${cy + 10})" d="${code.d}" fill="#fff"/>
  ${orbitSvg}
  <rect width="${W}" height="${H}" rx="26" fill="none" stroke="#ffffff" stroke-opacity=".08"/>
</g>
</svg>`;
}

/* ---------------------------------------------------------------- terminal */
function terminal() {
  const W = 560;
  const H = 384;
  const CW = 9.4; // approx. monospace advance at 15px (Menlo / Consolas / DejaVu)
  const D = 16; // loop length, s
  const lines = [
    { t: 0.3, type: '$ whoami' },
    { t: 1.6, out: 'cdDuke · frontend & bots', color: C.fg },
    { t: 2.2, type: '$ cat skills.json' },
    { t: 3.5, out: '{ "web":    "React · TS · Vite",', color: C.muted },
    { t: 3.7, out: '  "motion": "GSAP · Three.js",', color: C.muted },
    { t: 3.9, out: '  "bots":   "Python · aiogram" }', color: C.muted },
    { t: 4.6, type: '$ ls projects | wc -l' },
    { t: 6.0, out: String(N.total), color: C.mint },
    { t: 6.6, type: '$ echo $STATUS' },
    { t: 7.9, out: '✔ open to work · RU / EN', color: C.lime },
    { t: 8.6, prompt: true },
  ];
  const k = (s) => (s / D).toFixed(4);
  // SVG collapses runs of spaces, so keep JSON alignment with non-breaking spaces
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/ /g, '\u00a0');
  let y = 76;
  const body = lines
    .map((ln, i) => {
      const yy = y;
      y += 27;
      const show = `<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${k(ln.t)};${k(ln.t + 0.01)};${k(D - 0.6)};1" dur="${D}s" repeatCount="indefinite"/>`;
      if (ln.out) return `<text x="24" y="${yy}" fill="${ln.color}" opacity="0">${esc(ln.out)}${show}</text>`;
      if (ln.prompt)
        return `<g opacity="0">${show}<text x="24" y="${yy}" fill="${C.lime}">$</text><rect x="${24 + CW * 2}" y="${yy - 14}" width="9" height="18" fill="${C.fg}"><animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect></g>`;
      // typed command: reveal the text with a stepped clip rectangle
      const cmd = ln.type.slice(2);
      const steps = cmd.length;
      const typeDur = Math.min(1.1, steps * 0.075);
      const vals = ['0', '0'];
      const keys = ['0', k(ln.t)];
      for (let s = 1; s <= steps; s++) {
        vals.push(((s + 2.6) * CW).toFixed(1));
        keys.push(k(ln.t + (typeDur * s) / steps));
      }
      vals.push(((steps + 6) * CW).toFixed(1), '0');
      keys.push(k(D - 0.6), '1');
      return `<clipPath id="c${i}"><rect x="20" y="${yy - 18}" height="26" width="0"><animate attributeName="width" values="${vals.join(';')}" keyTimes="${keys.join(';')}" dur="${D}s" calcMode="discrete" repeatCount="indefinite"/></rect></clipPath>
<g clip-path="url(#c${i})" opacity="0">${show.replace(k(ln.t + 0.01), k(ln.t + 0.01))}<text x="24" y="${yy}"><tspan fill="${C.lime}">$</tspan><tspan fill="${C.fg}" dx="${CW}">${esc(cmd)}</tspan></text></g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Terminal: whoami → cdDuke, frontend and bots; ${N.total} projects; open to work">
<defs><linearGradient id="tb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1a1a24"/><stop offset="1" stop-color="#14141c"/></linearGradient></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="#0e0e15" stroke="#ffffff1c"/>
<path d="M.5 40V16.5a16 16 0 0 1 16-16h${W - 33}a16 16 0 0 1 16 16V40Z" fill="url(#tb)"/>
<line x1="0" x2="${W}" y1="40" y2="40" stroke="#ffffff12"/>
<circle cx="24" cy="20" r="6" fill="#ff5f57"/><circle cx="44" cy="20" r="6" fill="#febc2e"/><circle cx="64" cy="20" r="6" fill="#28c840"/>
<text x="${W / 2}" y="25" fill="${C.dim}" font-family="${MONO}" font-size="13" text-anchor="middle">cdduke — zsh</text>
<g font-family="${MONO}" font-size="15" xml:space="preserve">
${body}
</g>
</svg>`;
}

/* ----------------------------------------------------------------- divider */
function divider() {
  const W = 1280;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 28" width="${W}" height="28" aria-hidden="true">
<defs><linearGradient id="sw" x1="-480" x2="0" y1="0" y2="0" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="${C.violet}" stop-opacity="0"/><stop offset=".45" stop-color="${C.mint}"/><stop offset=".6" stop-color="${C.lime}"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
<animate attributeName="x1" values="-480;${W}" dur="5s" repeatCount="indefinite"/><animate attributeName="x2" values="0;${W + 480}" dur="5s" repeatCount="indefinite"/>
</linearGradient></defs>
<rect y="13.5" width="${W}" height="1" fill="#8b8a99" fill-opacity=".25"/>
<rect y="13" width="${W}" height="2" fill="url(#sw)"/>
<g transform="translate(${W / 2} 14) rotate(45)"><rect x="-5" y="-5" width="10" height="10" fill="${C.bg}" stroke="${C.lime}" stroke-width="1.5"><animate attributeName="opacity" values="1;.4;1" dur="2.4s" repeatCount="indefinite"/></rect></g>
</svg>`;
}

/* ------------------------------------------------------------------- stats */
function stats() {
  const W = 1280;
  const H = 156;
  const items = [
    [String(N.total), plural(N.total, 'проект в портфолио', 'проекта в портфолио', 'проектов в портфолио')],
    [String(N.demos), plural(N.demos, 'живое демо онлайн', 'живых демо онлайн', 'живых демо онлайн')],
    [String(N.bots), plural(N.bots, 'Telegram-бот', 'Telegram-бота', 'Telegram-ботов')],
    ['RU/EN', 'в каждом проекте'],
    ['390+', 'px: адаптив везде'],
  ];
  const gap = 16;
  const tw = (W - gap * (items.length - 1)) / items.length;
  const tiles = items
    .map(([n, label], i) => {
      const x = i * (tw + gap);
      let ns = 46;
      while (measure(n, { size: ns }) > tw - 44) ns -= 2;
      const num = textPath(n, { size: ns, x: x + 24, y: 78 });
      const lab = textPath(label, { font: 'manrope', weight: 500, size: 16, x: x + 24, y: 118 });
      return `<g class="tile" style="animation-delay:${i * 0.12}s">
  <rect x="${x + 0.5}" y=".5" width="${tw - 1}" height="${H - 1}" rx="20" fill="#111118" stroke="url(#edge)"/>
  <path d="${num.d}" fill="url(#brand)"/>
  <path d="${lab.d}" fill="${C.muted}"/></g>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${N.total} projects, ${N.demos} live demos, ${N.bots} Telegram bots, RU/EN everywhere, responsive from 390px">
<style>.tile{animation:rise 1s cubic-bezier(.22,1,.36,1) both}@keyframes rise{from{opacity:0;transform:translateY(12px)}}</style>
<defs>
<linearGradient id="brand" x1="0" x2="${W}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.lime}"/><stop offset=".5" stop-color="${C.mint}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
<linearGradient id="edge" x1="-500" x2="0" y1="0" y2="0" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ffffff" stop-opacity=".09"/><stop offset=".5" stop-color="${C.lime}" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity=".09"/>
<animate attributeName="x1" values="-500;${W}" dur="7s" repeatCount="indefinite"/><animate attributeName="x2" values="0;${W + 500}" dur="7s" repeatCount="indefinite"/>
</linearGradient>
</defs>
${tiles}
</svg>`;
}

save('banner.svg', banner());
save('terminal.svg', terminal());
save('divider.svg', divider());
save('stats.svg', stats());
