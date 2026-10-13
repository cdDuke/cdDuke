// Generates README.md for the cdDuke/cdDuke profile repository from projects.json.
import { readFileSync, writeFileSync } from 'node:fs';

const projects = JSON.parse(readFileSync(new URL('./projects.json', import.meta.url), 'utf8'));
const USER = 'cdDuke';
const SITE = 'https://cdduke.github.io';
const demo = (p) => `${SITE}/${p.repo}/`;
const repo = (p) => `https://github.com/${USER}/${p.repo}`;

const badge = (label, color, logo, logoColor = 'white') =>
  `![${label.replace(/_/g, ' ')}](https://img.shields.io/badge/${encodeURIComponent(label)}-${color}?style=flat-square${logo ? `&logo=${logo}&logoColor=${logoColor}` : ''})`;

const chips = (p) => `<sub>${p.stack.map((s) => `\`${s}\``).join(' ')}</sub>`;

function cell(p, { colspan = 1, imgWidth = '100%' } = {}) {
  const isBot = p.kind === 'bot';
  const link = isBot ? repo(p) : demo(p);
  const links = isBot ? `<a href="${repo(p)}">📦 Код</a>` : `<a href="${demo(p)}"><b>▶ Демо</b></a> · <a href="${repo(p)}">📦 Код</a>`;
  return `<td valign="top" width="${Math.round(100 / (isBot ? 3 : 2)) * colspan}%"${colspan > 1 ? ` colspan="${colspan}"` : ''}>

<a href="${link}"><img src="assets/cards/${p.id}.webp" alt="${p.titleEn || p.title}" width="${imgWidth}"></a>

### ${p.emoji} [${p.title}](${repo(p)})
${p.ru}<br>
${chips(p)}<br>
${links}

</td>`;
}

function grid(list, cols) {
  let html = '<table>\n';
  for (let i = 0; i < list.length; i += cols) {
    const row = list.slice(i, i + cols);
    html += '<tr>\n';
    if (row.length < cols && cols === 2) html += cell(row[0], { colspan: 2, imgWidth: '62%' });
    else html += row.map((p) => cell(p)).join('\n');
    html += '\n</tr>\n';
  }
  return html + '</table>';
}

const apps = projects.filter((p) => p.kind === 'app');
const sites = projects.filter((p) => p.kind === 'site');
const bots = projects.filter((p) => p.kind === 'bot');
const divider = '<img src="assets/divider.svg" width="100%" alt="">';

const md = `<div align="center">

<img src="assets/banner.svg" alt="cdDuke — frontend developer: animations, 3D/WebGL and Telegram bots" width="100%">

<br>

[![Portfolio](https://img.shields.io/badge/Портфолио-cdduke.github.io-d7ff3d?style=for-the-badge&logo=githubpages&logoColor=0b0b10&labelColor=12121a)](${SITE})
[![Open to work](https://img.shields.io/badge/Статус-открыт_к_работе-8b6cff?style=for-the-badge&labelColor=12121a)](#-связаться--contact)
[![Projects](https://img.shields.io/badge/Проекты-${projects.length}-7dffcf?style=for-the-badge&logo=github&logoColor=0b0b10&labelColor=12121a)](#-проекты--projects)

![Profile views](https://hits.sh/github.com/${USER}.svg?style=for-the-badge&label=Profile%20views&color=d7ff3d&labelColor=12121a)

</div>

${divider}

## 👋 Обо мне · About me

<table>
<tr>
<td valign="top" width="52%">

🎨 **Frontend-разработчик**: делаю интерфейсы, которые ощущаются живыми — анимации, 3D, плавный скролл<br>
⚛️ Пишу на **React + TypeScript**, собираю на **Vite**, анимирую на **GSAP** и **Three.js**<br>
🤖 Делаю **Telegram-ботов** на Python (aiogram 3) — от мониторинга серверов до AI-юриста<br>
🧠 Подключаю **AI**: OpenAI-совместимые API, OCR, генерация документов<br>
🌍 Каждый проект — **адаптив** под телефон и **две языковые версии** (RU / EN)<br>
🎯 Открыт к **работе в команде** и **фриланс-проектам**

<sub>🇬🇧 Frontend developer building lively interfaces — animation, 3D/WebGL, React apps — and Python Telegram bots with AI features. Every project ships with a live demo, mobile layout and RU/EN. Open to full-time roles and freelance.</sub>

</td>
<td valign="top" width="48%">

<img src="assets/terminal.svg" alt="Terminal: whoami" width="100%">

</td>
</tr>
</table>

<img src="assets/stats.svg" alt="${projects.length} projects · ${apps.length + sites.length} live demos · ${bots.length} Telegram bots · RU/EN · responsive" width="100%">

${divider}

## 🧠 Что умею · What I do

<table>
<tr>
<td valign="top" width="50%">

#### 🎬 Анимации и моушн
GSAP (ScrollTrigger, SplitText, DrawSVG), Motion, Lenis, CSS-анимации, интро и скролл-сторителлинг — с уважением к \`prefers-reduced-motion\`

</td>
<td valign="top" width="50%">

#### 🪐 3D и графика
Three.js и собственные GLSL-шейдеры, Canvas 2D (частицы, дождь, снег), процедурный SVG: пейзажи, блюда, фасады и планировки нарисованы кодом

</td>
</tr>
<tr>
<td valign="top">

#### ⚛️ React-приложения
React 19 + TypeScript strict, Zustand, dnd-kit, состояние в URL, формы с валидацией, undo-история, тёмная тема без мигания

</td>
<td valign="top">

#### 🔌 Работа с API
REST (Open-Meteo), автодополнение с debounce и AbortController, пакетные запросы, скелетоны и понятные экраны ошибок

</td>
</tr>
<tr>
<td valign="top">

#### 🤖 Telegram-боты
aiogram 3, FSM-сценарии, middlewares, планировщик задач, SQLAlchemy + SQLite, админ-панели, рассылки, деплой через systemd

</td>
<td valign="top">

#### 🧠 AI-интеграции
OpenAI-совместимые API, промпты под предметную область, OCR (Tesseract), генерация DOCX и PDF

</td>
</tr>
<tr>
<td valign="top">

#### ♿ Качество
Адаптив 390–1440 px, доступность (ARIA, клавиатура, скринридеры), i18n RU/EN, автопроверка в headless Chrome

</td>
<td valign="top">

#### 🚀 Сборка и деплой
Vite, ленивая загрузка тяжёлых модулей, GitHub Actions → GitHub Pages, секреты только в \`.env\`

</td>
</tr>
</table>

${divider}

## 🛠 Стек · Tech stack

<div align="center">

[![Skills](https://skillicons.dev/icons?i=ts,js,react,vite,html,css,threejs,python,sqlite,git,githubactions,linux&perline=12)](#-стек--tech-stack)

</div>

**Frontend**<br>
${badge('TypeScript', '3178C6', 'typescript')}
${badge('JavaScript', 'F7DF1E', 'javascript', 'black')}
${badge('React_19', '20232A', 'react', '61DAFB')}
${badge('Vite', '646CFF', 'vite')}
${badge('HTML5', 'E34F26', 'html5')}
${badge('CSS3', '1572B6', 'css3')}

**Motion & 3D**<br>
${badge('GSAP', '88CE02', 'greensock', 'black')}
${badge('Three.js', '000000', 'threedotjs')}
${badge('GLSL', '5586A4', 'opengl')}
${badge('Motion', 'FF0055', 'framer')}
${badge('Lenis', 'FF98A2', '', 'black')}
${badge('Canvas_2D', 'E34F26')}
${badge('SVG', 'FFB13B', 'svg', 'black')}

**State & quality**<br>
${badge('Zustand', '443E38')}
${badge('dnd--kit', '4B5563')}
${badge('i18n', '0EA5E9')}
${badge('a11y', '7C3AED')}
${badge('Puppeteer', '40B5A4', 'puppeteer')}

**Bots & backend**<br>
${badge('Python', '3776AB', 'python')}
${badge('aiogram_3', '2CA5E0', 'telegram')}
${badge('SQLAlchemy', 'D71F00', 'sqlalchemy')}
${badge('SQLite', '003B57', 'sqlite')}
${badge('APScheduler', '4B5563')}
${badge('aiohttp', '2C5BB4', 'aiohttp')}

**AI**<br>
${badge('OpenAI_API', '412991', 'openai')}
${badge('Tesseract_OCR', '5C6BC0')}
${badge('python--docx', '2B579A', 'microsoftword')}

**Tools**<br>
${badge('Git', 'F05032', 'git')}
${badge('GitHub_Actions', '2088FF', 'githubactions')}
${badge('GitHub_Pages', '222222', 'githubpages')}
${badge('Linux', 'FCC624', 'linux', 'black')}
${badge('systemd', '30D475')}

${divider}

## 🚀 Проекты · Projects

> Все веб-проекты открываются прямо в браузере — кнопка **▶ Демо**. Код и подробный README — по ссылке **📦 Код**.

### ⚡ Веб-приложения

${grid(apps, 2)}

### 🎨 Сайты и лендинги

${grid(sites, 2)}

### 🤖 Telegram-боты

${grid(bots, 3)}

### 🌐 Сайт-портфолио · [cdduke.github.io ↗](${SITE})

<a href="${SITE}"><img src="assets/cards/portfolio.webp" alt="Portfolio website" width="62%"></a>

Все проекты на одной странице: фильтр по типу, живые демо, RU/EN. Одна HTML-страница без сборки.<br>
<sub>\`HTML5\` \`CSS3\` \`JavaScript\` \`GitHub Pages\`</sub>

${divider}

## 🐍 Активность · Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${USER}/${USER}/output/github-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${USER}/${USER}/output/github-snake.svg">
  <img alt="Snake eating my contribution graph" src="https://raw.githubusercontent.com/${USER}/${USER}/output/github-snake-dark.svg" width="100%">
</picture>

${divider}

## 📬 Связаться · Contact

| | |
|---|---|
| 🌐 Сайт · Website | [cdduke.github.io](${SITE}) |
| 🐙 GitHub | [@${USER}](https://github.com/${USER}) |

<div align="center">

<sub>cdDuke<b>.</b> · сделано с ⚡, TypeScript и Python</sub>

</div>
`;

writeFileSync(new URL('../README.md', import.meta.url), md);
console.log('README.md written,', md.length, 'chars');
