import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
const [, , name, out, w = 1280, h = 420, times = '2,6,10'] = process.argv;
const src = pathToFileURL(fileURLToPath(new URL(`../assets/${name}`, import.meta.url))).href;
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h });
await p.goto(src);
const t0 = Date.now();
for (const t of times.split(',').map(Number)) {
  const wait = t * 1000 - (Date.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  await p.screenshot({ path: `${out}/${name}-${t}.png` });
}
await b.close();
