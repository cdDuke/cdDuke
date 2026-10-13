// Renders a showcase card for every project: desktop screenshot in a browser
// frame plus the mobile screenshot in a phone frame (bots use their cover art).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = fileURLToPath(new URL('../../', import.meta.url)); // ~/Documents/Портфолио/
const OUT = fileURLToPath(new URL('../assets/cards/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const projects = JSON.parse(readFileSync(new URL('./projects.json', import.meta.url), 'utf8'));
const only = process.argv.slice(2);
// the portfolio site itself is not a regular project entry
projects.push({ id: 'portfolio', repo: '', dir: '00-portfolio-hub', kind: 'site', accent: '#d7ff3d' });

const url = (p) => pathToFileURL(p).href;

const siteCard = (p, desk, mob) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
html,body{background:transparent}
body{width:1200px;height:760px;font-family:-apple-system,system-ui,sans-serif}
.panel{position:absolute;inset:0;border-radius:30px;overflow:hidden;border:1px solid #ffffff17;
  background:radial-gradient(700px 420px at 92% 0%, ${p.accent}55, transparent 70%),radial-gradient(500px 400px at 0% 100%, ${p.accent}22, transparent 70%),linear-gradient(160deg,#16161f,#0c0c12)}
.grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff07 1px,transparent 1px),linear-gradient(90deg,#ffffff07 1px,transparent 1px);background-size:40px 40px}
.browser{position:absolute;left:48px;top:56px;width:900px;border-radius:14px;overflow:hidden;background:#101016;
  box-shadow:0 0 0 1px #ffffff1c,0 40px 80px -30px #000,0 0 120px -40px ${p.accent}}
.bar{height:40px;display:flex;align-items:center;gap:8px;padding:0 14px;background:#1b1b25;border-bottom:1px solid #ffffff10}
.bar i{width:12px;height:12px;border-radius:50%}
.url{margin-left:18px;flex:1;max-width:460px;height:24px;border-radius:7px;background:#0f0f15;color:#9a98a6;font-size:13px;display:flex;align-items:center;gap:7px;padding:0 10px}
.url b{color:#e9e7f0;font-weight:500}
.shot{display:block;width:900px;height:562px;object-fit:cover;object-position:top}
.phone{position:absolute;right:48px;bottom:40px;width:236px;height:510px;border-radius:38px;padding:9px;background:#050507;
  box-shadow:0 0 0 1px #ffffff26,0 40px 70px -20px #000,0 0 90px -30px ${p.accent}}
.phone img{width:100%;height:100%;border-radius:30px;object-fit:cover;object-position:top;display:block}
.notch{position:absolute;top:18px;left:50%;width:70px;height:20px;margin-left:-35px;border-radius:12px;background:#050507}
</style></head><body><div class="panel"><div class="grid"></div>
<div class="browser"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>
<div class="url">🔒 <span>cdduke.github.io/<b>${p.repo}</b></span></div></div><img class="shot" src="${url(desk)}"></div>
<div class="phone"><img src="${url(mob)}"><div class="notch"></div></div>
</div></body></html>`;

const botCard = (p, cover) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0}html,body{background:transparent}body{width:1200px;height:600px}
img{width:1200px;height:600px;border-radius:30px;display:block;box-shadow:inset 0 0 0 1px #ffffff17}
.wrap{position:relative;width:1200px;height:600px;border-radius:30px;overflow:hidden}
.wrap::after{content:'';position:absolute;inset:0;border-radius:30px;box-shadow:inset 0 0 0 1px #ffffff1c}
</style></head><body><div class="wrap"><img src="${url(cover)}"></div></body></html>`;

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
for (const p of projects) {
  if (only.length && !only.includes(p.id)) continue;
  const dir = ROOT + p.dir + '/docs/';
  let html;
  let size;
  if (p.kind === 'bot') {
    html = botCard(p, dir + 'cover.png');
    size = { width: 1200, height: 600 };
  } else {
    const desk = dir + 'preview-desktop.png';
    const mob = dir + 'preview-mobile.png';
    if (!existsSync(desk) || !existsSync(mob)) {
      console.warn('skip (no screenshots)', p.id);
      continue;
    }
    html = siteCard(p, desk, mob);
    size = { width: 1200, height: 760 };
  }
  await page.setViewport({ ...size, deviceScaleFactor: 1 });
  const tmp = fileURLToPath(new URL(`./.card-${p.id}.html`, import.meta.url));
  (await import('node:fs')).writeFileSync(tmp, html);
  await page.goto(url(tmp), { waitUntil: 'load' });
  await page.screenshot({ path: OUT + p.id + '.webp', type: 'webp', quality: 86, omitBackground: true });
  (await import('node:fs')).unlinkSync(tmp);
  console.log('card', p.id);
}
await browser.close();
