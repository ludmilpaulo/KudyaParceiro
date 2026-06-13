import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8091';
const SHOT_DIR = path.join(__dirname, 'shots');

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('Opening', BASE);
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120000 });
  await page.screenshot({ path: path.join(SHOT_DIR, '01-landing.png'), fullPage: true });

  const fillBtn = page.getByText('Fill test doctor login', { exact: false });
  if (await fillBtn.count()) {
    await fillBtn.click();
    console.log('Clicked Fill test doctor login');
  } else {
    const inputs = page.locator('input');
    await inputs.nth(0).fill('doctor@kudya.shop');
    await inputs.nth(1).fill('seedpass123');
    console.log('Filled credentials manually');
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOT_DIR, '02-filled.png'), fullPage: true });

  await page.getByText('Sign in', { exact: true }).first().click();
  console.log('Clicked Sign in');

  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SHOT_DIR, '03-after-login.png'), fullPage: true });

  const body = await page.locator('body').innerText();
  const url = page.url();
  const stillOnLogin = /Welcome back/i.test(body);
  const loggedIn = !stillOnLogin && /Healthcare|Dashboard|Appointments|Verification|doctor/i.test(body);

  console.log('\n--- Result ---');
  console.log('URL:', url);
  console.log('Logged in:', loggedIn);
  if (errors.length) console.log('Console errors:', errors.slice(0, 5).join(' | '));
  console.log('Screenshots:', SHOT_DIR);

  await browser.close();
  if (!loggedIn) process.exit(1);
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
