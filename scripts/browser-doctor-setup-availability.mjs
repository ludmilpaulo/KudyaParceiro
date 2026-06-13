/**
 * Logs into Kudya web doctor dashboard and saves weekly availability.
 *
 * Run: node scripts/browser-doctor-setup-availability.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = process.env.KUDYA_WEB || 'http://localhost:3000';
const API = process.env.KUDYA_API || 'http://127.0.0.1:8000';
const EMAIL = process.env.DOCTOR_EMAIL || 'doctor.browser@kudya.shop';
const PASSWORD = process.env.DOCTOR_PASSWORD || 'seedpass123';
const SHOT_DIR = path.join(__dirname, 'shots', 'doctor-setup');

async function ensureDoctorApproved() {
  const loginRes = await fetch(`${API}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login API failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const auth = await loginRes.json();
  const token = auth.access || auth.api_token;
  const meRes = await fetch(`${API}/api/doctors/me/verification-status/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) {
    console.warn('Could not fetch verification status:', meRes.status);
    return;
  }
  const status = await meRes.json();
  console.log('Doctor verification:', status.verification_status, 'canOperate:', status.can_operate);
  if (!status.can_operate) {
    throw new Error('Doctor is not approved yet — run Django approve step first.');
  }
}

async function getAvailabilityCount() {
  const loginRes = await fetch(`${API}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: EMAIL, password: PASSWORD }),
  });
  const auth = await loginRes.json();
  const token = auth.access || auth.api_token;
  const avRes = await fetch(`${API}/api/doctors/me/availability/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const availability = await avRes.json();
  return Array.isArray(availability) ? availability.length : 0;
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await ensureDoctorApproved();
  const beforeCount = await getAvailabilityCount();

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();

  console.log('1) Login at', `${WEB}/LoginScreenUser?next=/dashboard/doctor`);
  await page.goto(`${WEB}/LoginScreenUser?next=/dashboard/doctor`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.screenshot({ path: path.join(SHOT_DIR, '01-login.png'), fullPage: true });

  await page.locator('input[type="text"], input[name="username"], input').first().fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.screenshot({ path: path.join(SHOT_DIR, '02-filled.png'), fullPage: true });

  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => {
    try {
      const raw = localStorage.getItem('auth_token');
      return Boolean(raw && raw !== 'null' && raw.length > 4);
    } catch {
      return false;
    }
  }, { timeout: 30000 });
  await page.goto(`${WEB}/dashboard/doctor`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Clinica Browser Test|Clínica Browser Test/i).first().waitFor({ timeout: 60000 });
  await page.screenshot({ path: path.join(SHOT_DIR, '03-dashboard.png'), fullPage: true });

  console.log('2) Open Availability tab');
  await page.getByRole('button', { name: /set availability|definir disponibilidade|disponibilidade/i }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '04-availability-tab.png'), fullPage: true });

  console.log('3) Configure Wednesday 10:00–17:00 and save');
  const weeklyPanel = page.locator('section').filter({ hasText: /Weekly availability|Disponibilidade semanal/i });
  await weeklyPanel.locator('select').first().selectOption('2'); // Wednesday
  await weeklyPanel.locator('input[type="time"]').first().fill('10:00');
  await weeklyPanel.locator('input[type="time"]').nth(1).fill('17:00');

  await weeklyPanel.getByRole('button', { name: /save availability|guardar disponibilidade/i }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SHOT_DIR, '05-after-save.png'), fullPage: true });

  const afterCount = await getAvailabilityCount();
  const savedMessage = await page.locator('body').innerText();

  console.log('\n--- Result ---');
  console.log('URL:', page.url());
  console.log('Availability rules before:', beforeCount, 'after:', afterCount);
  console.log('Save confirmation visible:', /saved|guardad/i.test(savedMessage));
  console.log('Screenshots:', SHOT_DIR);

  await browser.close();

  if (afterCount <= beforeCount) {
    throw new Error('Availability was not saved — count did not increase.');
  }
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
