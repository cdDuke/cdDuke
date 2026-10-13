// Renders the SVGs the way GitHub shows them (as <img>) at several moments of the animation.
import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = pathToFileURL(fileURLToPath(new URL('../assets/', import.meta.url))).href;
const out = process.argv[2] || '/tmp';
const html = `<html><body style="margin:0;background:#0d1117;padding:24px;width:1280px">
<img src="${dir}banner.svg" style="width:100%;display:block">
<img src="${dir}divider.svg" style="width:100%;display:block;margin:12px 0">
<div style="display:flex;gap:24px;align-items:flex-start"><div style="flex:1;color:#c9d1d9;font:16px system-ui">text column</div><img src="${dir}terminal.svg" style="width:48%"></div>
<img src="${dir}stats.svg" style="width:100%;display:block;margin-top:16px">
</body></html>`;
import { writeFileSync } from 'node:fs';
const file = fileURLToPath(new URL('./preview.html', import.meta.url));
writeFileSync(file, html);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 1328, height: 1100, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(file).href, { waitUntil: 'load' });
let last = 0;
for (const t of [1.2, 5, 9.5]) {
  await new Promise((r) => setTimeout(r, (t - last) * 1000));
  last = t;
  await p.screenshot({ path: `${out}/profile-t${t}.png` });
}
await b.close();
