// Renders demo/sample.md the way the VS Code Markdown preview does and checks the
// spec's acceptance criteria in Chromium. Screenshots go to tests/out/.
//   cd tests && npm install && cd ..   (once)
//   node tests/check.js                (exits 0 when all checks pass)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mods = path.join(__dirname, 'node_modules');
const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });

const md = require(path.join(mods, 'markdown-it'))({ html: true, linkify: true, typographer: true })
  .use(require(path.join(mods, 'markdown-it-footnote')))
  .use(require(path.join(mods, 'markdown-it-task-lists')))
  .use(require(path.join(mods, '@vscode/markdown-it-katex')).default);
const body = md.render(fs.readFileSync(path.join(root, 'demo/sample.md'), 'utf8'));

const PALETTES = {
  'dark-inchiostro': ['dark', '#1e1e1c', '#dcd7cc'],
  'dark-notte': ['dark', '#161b26', '#cfd6e4'],
  'dark-lavagna': ['dark', '#1c2321', '#d6dcd4'],
  'light-carta': ['light', '#fbf8f1', '#2b2925'],
  'light-bianco': ['light', '#ffffff', '#24292f'],
  'light-foglio-protocollo': ['light', '#fdfdf8', '#2a2a2a'],
};

const url = (p) => 'file://' + p;
// VS Code's own preview stylesheet, if downloaded (see README), so the theme is tested against it
const vscodeCss = path.join(__dirname, 'vscode-markdown.css');
function page(styles, mode, extraClass = '') {
  const links = [path.join(mods, 'katex/dist/katex.min.css'), ...(fs.existsSync(vscodeCss) ? [vscodeCss] : []), ...styles]
    .map((s) => `<link rel="stylesheet" href="${url(s)}">`).join('\n');
  const file = path.join(out, `page-${mode}.html`);
  fs.writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8">
<style>body { margin: 0; padding: 0 20px; background-color: transparent; }</style>
${links}</head>
<body class="vscode-body vscode-${mode} ${extraClass}"><div class="markdown-body" dir="auto">${body}</div></body></html>`);
  return url(file);
}

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' (' + detail + ')' : ''}`);
  if (!ok) failures++;
}
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;

(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const base = path.join(root, 'base.css');
  const pal = (n) => path.join(root, 'palettes', n + '.css');

  // 1, 2, 5: layout, fonts, code, tables, maths, with the default pair and VS Code's word wrap on
  await tab.goto(page([base, pal('dark-inchiostro'), pal('light-carta')], 'dark', 'wordWrap'));
  await tab.evaluate(() => document.fonts.ready);
  const m = await tab.evaluate(() => {
    const b = document.body, cs = getComputedStyle(b);
    const probe = document.createElement('div');
    probe.style.width = '80ch';
    b.appendChild(probe);
    const ch80 = probe.getBoundingClientRect().width;
    probe.remove();
    const rect = b.getBoundingClientRect();
    const pres = [...document.querySelectorAll('pre')];
    const wide = pres.find((p) => p.textContent.includes('markdown.styles'));
    const fam = (sel) => getComputedStyle(document.querySelector(sel)).fontFamily;
    return {
      width: parseFloat(cs.width), ch80, left: rect.left, right: innerWidth - rect.right,
      fonts: ['17px Literata', '600 20px "IBM Plex Sans"', '17px "Ubuntu Mono"'].map((f) => document.fonts.check(f)),
      loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
      bodyFont: fam('p'), headFont: fam('h2'), codeFont: fam('p code'),
      codeRatio: parseFloat(getComputedStyle(document.querySelector('p code')).fontSize) / parseFloat(cs.fontSize),
      preScroll: wide.scrollWidth > wide.clientWidth, preWhite: getComputedStyle(wide).whiteSpace,
      tableRows: document.querySelectorAll('table tbody tr').length,
      katex: document.querySelectorAll('.katex').length,
      katexFont: getComputedStyle(document.querySelector('.katex')).fontFamily,
      katexDisplayOverflow: getComputedStyle(document.querySelector('.katex-display')).overflowX,
      tasks: document.querySelectorAll('.task-list-item input[type=checkbox]').length,
      footnotes: document.querySelectorAll('.footnotes li').length,
      quoteBorder: getComputedStyle(document.querySelector('blockquote')).borderLeftColor,
    };
  });
  check('column is 80ch wide', Math.abs(m.width - m.ch80) < 1, `${m.width.toFixed(1)}px vs 80ch = ${m.ch80.toFixed(1)}px`);
  check('column is centred', Math.abs(m.left - m.right) < 2, `${m.left.toFixed(0)} / ${m.right.toFixed(0)}`);
  check('web fonts loaded', m.fonts.every(Boolean) && ['Literata', 'IBM Plex Sans', 'Ubuntu Mono'].every((f) => m.loaded.includes(f)), m.fonts.join(','));
  check('body font is Literata', m.bodyFont.startsWith('Literata'), m.bodyFont);
  check('heading font is IBM Plex Sans', m.headFont.startsWith('"IBM Plex Sans"'), m.headFont);
  check('code font is Ubuntu Mono, scaled up', m.codeFont.startsWith('"Ubuntu Mono"') && m.codeRatio >= 1.05 && m.codeRatio <= 1.1, m.codeRatio.toFixed(3));
  check('long code line scrolls, even with word wrap on', m.preScroll && m.preWhite === 'pre', m.preWhite);
  check('table rendered', m.tableRows === 6);
  check('KaTeX keeps its own font', m.katex >= 3 && m.katexFont.includes('KaTeX_Main'), m.katexFont);
  check('display maths scrolls', m.katexDisplayOverflow === 'auto');
  check('task list and footnotes rendered', m.tasks === 3 && m.footnotes === 2);
  check('blockquote border uses --accent', m.quoteBorder === rgb('#c96b5a'), m.quoteBorder);
  await tab.screenshot({ path: path.join(out, 'default-dark.png'), fullPage: true });

  // 3: flipping the editor theme flips the palette, no reload
  const bg = () => tab.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('dark theme picks Inchiostro', (await bg()) === rgb('#1e1e1c'), await bg());
  await tab.evaluate(() => document.body.classList.replace('vscode-dark', 'vscode-light'));
  check('light theme picks Carta', (await bg()) === rgb('#fbf8f1'), await bg());
  await tab.evaluate(() => document.body.classList.replace('vscode-light', 'vscode-high-contrast'));
  check('high contrast falls back to Inchiostro', (await bg()) === rgb('#1e1e1c'), await bg());
  await tab.evaluate(() => document.body.classList.add('vscode-high-contrast-light'));
  check('high contrast light falls back to Carta', (await bg()) === rgb('#fbf8f1'), await bg());

  // 4: each palette on its own
  for (const [name, [mode, bgHex, fgHex]] of Object.entries(PALETTES)) {
    await tab.goto(page([base, pal(name)], mode));
    await tab.evaluate(() => document.fonts.ready);
    const c = await tab.evaluate(() => {
      const cs = getComputedStyle(document.body);
      const before = getComputedStyle(document.body, '::before').backgroundImage;
      return { bg: cs.backgroundColor, fg: cs.color, rule: cs.getPropertyValue('--rule').trim(), before };
    });
    check(`${name}: colours applied`, c.bg === rgb(bgHex) && c.fg === rgb(fgHex), `${c.bg} / ${c.fg}`);
    if (name === 'light-foglio-protocollo') check(`${name}: ruled lines on`, c.rule === '#dfe6f0' && c.before.includes('223, 230, 240'));
    else check(`${name}: no ruled lines`, c.rule === 'transparent');
    await tab.screenshot({ path: path.join(out, name + '.png') });
  }

  // The bundle is base.css plus the two default palettes
  const bundle = fs.readFileSync(path.join(root, 'foglio-protocollo.css'), 'utf8');
  const parts = ['base.css', 'palettes/dark-inchiostro.css', 'palettes/light-carta.css'].map((f) => fs.readFileSync(path.join(root, f), 'utf8'));
  check('bundle is up to date (scripts/bundle.sh)', bundle.endsWith(parts.join('')));

  // Embedding: a `.foglio` element outside VS Code gets the same styling
  const embed = path.join(out, 'embed.html');
  fs.writeFileSync(embed, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${url(base)}"><link rel="stylesheet" href="${url(pal('light-carta'))}"></head>
<body class="vscode-light"><nav>toolbar</nav><article class="foglio">${body}</article></body></html>`);
  await tab.goto(url(embed));
  const e = await tab.evaluate(() => ({
    font: getComputedStyle(document.querySelector('.foglio p')).fontFamily,
    nav: getComputedStyle(document.querySelector('nav')).fontFamily,
    hl: getComputedStyle(document.body).getPropertyValue('--highlight').trim(),
  }));
  check('embedded .foglio root is styled, the rest of the page is not', e.font.startsWith('Literata') && !e.nav.startsWith('Literata'), e.nav);
  check('--highlight resolves from the palette accent', e.hl.includes('color-mix') || e.hl.includes('rgb'), e.hl);

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
