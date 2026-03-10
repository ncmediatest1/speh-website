import pkg from './node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'mobile';

const screenshotsDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotsDir)) mkdirSync(screenshotsDir, { recursive: true });

const existing = readdirSync(screenshotsDir).filter(f => f.startsWith('screenshot-'));
let n = 1;
if (existing.length > 0) {
  const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(Boolean);
  if (nums.length > 0) n = Math.max(...nums) + 1;
}

const filepath = join(screenshotsDir, `screenshot-${n}-${label}.png`);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await pkg.launch({
  executablePath: CHROME_PATH,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll to trigger observers
await page.evaluate(async () => {
  await new Promise(resolve => {
    let total = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 300);
      total += 300;
      if (total >= document.body.scrollHeight) {
        window.scrollTo(0, 0);
        clearInterval(timer);
        setTimeout(resolve, 400);
      }
    }, 100);
  });
});

await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();
console.log(`Mobile screenshot saved: ${filepath}`);
