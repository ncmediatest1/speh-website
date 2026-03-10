import pkg from './node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await pkg.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

// Trigger scroll-reveal
await page.evaluate(async () => {
  await new Promise(resolve => {
    let total = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 300);
      total += 300;
      if (total >= document.body.scrollHeight) {
        window.scrollTo(0, 0);
        clearInterval(timer);
        setTimeout(resolve, 300);
      }
    }, 80);
  });
});
await new Promise(r => setTimeout(r, 800));

// Shot 1: hero viewport (top)
await page.screenshot({ path: join(dir, 'screenshot-6-mobile-hero.png'), fullPage: false });

// Shot 2: partners section
await page.evaluate(() => {
  const el = document.getElementById('partnerji');
  if (el) el.scrollIntoView({ behavior: 'instant' });
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: join(dir, 'screenshot-7-mobile-partners.png'), fullPage: false });

await browser.close();
console.log('Targeted screenshots saved.');
