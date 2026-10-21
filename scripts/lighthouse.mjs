// Lighthouse audit: 2 pages x 2 form factors x RUNS runs, against a running preview server.
// Usage: node scripts/lighthouse.mjs   (env: BASE_URL, RUNS, CHROME_PATH)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import lighthouse, { desktopConfig } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL ?? 'http://localhost:4180';
const RUNS = Number(process.env.RUNS ?? 3);
const OUT = path.resolve('reports/lighthouse');
const PAGES = [
  { id: 'inicio', path: '/' },
  { id: 'detalhe', path: '/nfts/nft-1' },
];
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const chromePath = process.env.CHROME_PATH ??
  path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright', 'chromium-1248', 'chrome-win64', 'chrome.exe');

fs.mkdirSync(OUT, { recursive: true });
const config = (mode) => mode === 'desktop'
  ? desktopConfig
  : undefined; // default Lighthouse mobile: Moto G Power emulation, simulated slow 4G + 4x CPU
const summary = {
  generatedAt: new Date().toISOString(),
  lighthouse: require('lighthouse/package.json').version,
  chromeLauncher: require('chrome-launcher/package.json').version,
  chromePath,
  os: `${os.type()} ${os.release()} ${os.arch()}`,
  cpus: os.cpus().length,
  baseUrl: BASE, runsPerCombo: RUNS,
  throttlingMethod: 'simulate (Lighthouse defaults)',
  emulation: {
    mobile: 'Lighthouse default mobile (Moto G Power, 412x823 dpr 1.75, slow 4G 150ms RTT/1.6Mbps, CPU 4x)',
    desktop: 'Lighthouse desktopConfig (1350x940, 40ms RTT/10Mbps, CPU 1x)',
  },
  results: [],
};

const chrome = await chromeLauncher.launch({
  chromePath,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});
try {
  for (const mode of ['mobile', 'desktop']) {
    for (const pg of PAGES) {
      const runs = [];
      for (let i = 1; i <= RUNS; i++) {
        const url = BASE + pg.path;
        const flags = { port: chrome.port, output: ['json', 'html'], onlyCategories: CATS, logLevel: 'error' };
        const r = await lighthouse(url, flags, config(mode));
        const base = `${pg.id}-${mode}-run${i}`;
        fs.writeFileSync(path.join(OUT, `${base}.json`), r.report[0]);
        fs.writeFileSync(path.join(OUT, `${base}.html`), r.report[1]);
        const a = r.lhr.audits;
        const run = {
          run: i,
          scores: Object.fromEntries(CATS.map((c) => [c, Math.round((r.lhr.categories[c].score ?? 0) * 100)])),
          lcpMs: a['largest-contentful-paint'].numericValue,
          cls: a['cumulative-layout-shift'].numericValue,
          tbtMs: a['total-blocking-time'].numericValue,
          runWarnings: r.lhr.runWarnings,
        };
        runs.push(run);
        console.log(base, JSON.stringify(run.scores), Math.round(run.lcpMs), run.cls.toFixed(3), Math.round(run.tbtMs));
      }
      summary.results.push({
        page: pg.id, path: pg.path, mode, runs,
        median: {
          ...Object.fromEntries(CATS.map((c) => [c, median(runs.map((x) => x.scores[c]))])),
          lcpMs: median(runs.map((x) => x.lcpMs)),
          cls: median(runs.map((x) => x.cls)),
          tbtMs: median(runs.map((x) => x.tbtMs)),
        },
      });
    }
  }
} finally {
  await chrome.kill();
}
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
console.log('summary.json written');
