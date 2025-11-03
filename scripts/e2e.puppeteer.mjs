import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const indexPath = path.join(ROOT, 'index.html');
const indexUrl = 'file://' + indexPath;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const userDataDir = path.join(ROOT, '.chrome-data');
  try { fs.mkdirSync(userDataDir, { recursive: true }); } catch {}

  const execPath = puppeteer.executablePath?.() || undefined;
  console.log('Using Chromium at:', execPath);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: execPath,
    args: [
      '--lang=fa-IR',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process',
      '--noerrdialogs',
      '--disable-crash-reporter',
      '--no-crashpad',
      '--allow-file-access-from-files'
    ],
    userDataDir
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  console.log('Opening', indexUrl);
  await page.goto(indexUrl);

  // Interact: search a category and pick the first match
  await page.waitForSelector('input[placeholder="جستجوی دسته‌بندی..."]');
  await page.type('input[placeholder="جستجوی دسته‌بندی..."]', 'آجیل', { delay: 50 });
  await page.waitForSelector('button');
  const first = await page.$('button');
  if (first) await first.click();

  // Fill inputs
  await page.type('input[placeholder="مثلا 100000"]', '100000', { delay: 10 });
  const zeroInputs = await page.$$('input[placeholder="0"]');
  if (zeroInputs[0]) await zeroInputs[0].type('20000');
  if (zeroInputs[1]) await zeroInputs[1].type('5000');
  await page.focus('input[placeholder="20"]');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.type('input[placeholder="20"]', '30');

  await sleep(200);

  // Read result
  const priceText = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('قیمت پیشنهادی فروش'))?.parentElement;
    return el ? el.textContent : '';
  });
  console.log('Result block:', priceText);

  // Screenshot
  await page.screenshot({ path: path.join(ROOT, 'e2e_screenshot.png'), fullPage: true });
  console.log('Saved screenshot to e2e_screenshot.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
