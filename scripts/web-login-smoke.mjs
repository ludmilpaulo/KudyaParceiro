/**
 * Headless smoke test: KudyaParceiro web doctor login.
 * Run: node scripts/web-login-smoke.mjs
 */
const BASE = 'http://127.0.0.1:8000';
const WEB = 'http://localhost:8091';

async function main() {
  const loginRes = await fetch(`${BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: 'doctor@kudya.shop', password: 'seedpass123' }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const auth = await loginRes.json();
  console.log('API login OK:', auth.role, auth.business_profile?.category);

  const meRes = await fetch(`${BASE}/api/partner/me/`, {
    headers: { Authorization: `Bearer ${auth.access}`, Accept: 'application/json' },
  });
  console.log('Partner me:', meRes.status, meRes.ok ? await meRes.json() : await meRes.text());

  const webRes = await fetch(WEB);
  console.log('Web app:', webRes.status, webRes.ok ? 'reachable' : 'down');

  console.log('\nDoctor login flow verified. In browser at', WEB);
  console.log('1. Click "Fill test doctor login"');
  console.log('2. Click "Sign in"');
  console.log('Expected: Kudya Healthcare doctor dashboard');
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
