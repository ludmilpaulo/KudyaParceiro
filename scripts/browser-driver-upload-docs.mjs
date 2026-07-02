/**
 * Browser test: driver login + document upload on KudyaParceiro web.
 * Run: node scripts/browser-driver-upload-docs.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.PARCEIRO_WEB_URL ?? "http://localhost:8091";
const SHOT_DIR = path.join(__dirname, "shots");
const TEST_FILE = path.join(__dirname, "fixtures", "test-id-document.pdf");

const DRIVER = {
  username: "seed_driver",
  password: "seedpass123",
};

async function clickFirstMatching(page, patterns) {
  for (const pattern of patterns) {
    const loc = page.getByText(pattern, { exact: false }).first();
    if (await loc.count()) {
      await loc.click();
      return pattern;
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  if (!fs.existsSync(TEST_FILE)) {
    throw new Error(`Missing test file: ${TEST_FILE}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  console.log("Opening", BASE);
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  await page.screenshot({ path: path.join(SHOT_DIR, "driver-01-landing.png"), fullPage: true });

  const signInEntry = await clickFirstMatching(page, [
    "Sign in to your account",
    "Sign in to account",
    "Sign in",
  ]);
  console.log("Join action:", signInEntry ?? "not found");
  await page.waitForTimeout(1000);

  const inputs = page.locator("input");
  const inputCount = await inputs.count();
  console.log("Login inputs found:", inputCount);
  if (inputCount >= 2) {
    await inputs.nth(0).fill(DRIVER.username);
    await inputs.nth(1).fill(DRIVER.password);
  } else {
    throw new Error("Could not find username/password fields");
  }
  await page.screenshot({ path: path.join(SHOT_DIR, "driver-02-login-filled.png"), fullPage: true });

  await page.getByText("Sign in", { exact: true }).first().click();
  console.log("Submitted login");
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SHOT_DIR, "driver-03-after-login.png"), fullPage: true });

  const uploadDocsBtn = page.getByText("Upload documents", { exact: false }).first();
  if (await uploadDocsBtn.count()) {
    await uploadDocsBtn.click();
    console.log("Opened Upload documents");
  } else {
    throw new Error("Upload documents button not found — driver may already be verified");
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SHOT_DIR, "driver-04-documents.png"), fullPage: true });

  const selectFile = page.getByText("Select file", { exact: true }).first();
  if (!(await selectFile.count())) {
    throw new Error("Select file button not found");
  }

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 15000 }),
    selectFile.click(),
  ]);
  await fileChooser.setFiles(TEST_FILE);
  console.log("Selected test PDF for upload");

  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.join(SHOT_DIR, "driver-05-after-upload.png"), fullPage: true });

  const body = await page.locator("body").innerText();
  const uploaded =
    /Document uploaded successfully/i.test(body) ||
    /Uploaded on/i.test(body) ||
    /\bUploaded\b/i.test(body);

  console.log("\n--- Result ---");
  console.log("URL:", page.url());
  console.log("Upload confirmed in UI:", uploaded);
  if (errors.length) {
    console.log("Console/page errors:", errors.slice(0, 5).join("\n"));
  }

  await browser.close();
  if (!uploaded) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
