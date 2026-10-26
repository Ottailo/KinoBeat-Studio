import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureStudioClean() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outPath = path.resolve(__dirname, '..', 'tests', 'screenshots', 'verified_live_studio_redesign.png');

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Dismiss Walkthrough Modal by clicking "Enter Studio"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Enter Studio'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({ path: outPath, fullPage: false });
  console.log('✓ Captured clean live studio:', outPath);

  await browser.close();
}

captureStudioClean().catch(console.error);
