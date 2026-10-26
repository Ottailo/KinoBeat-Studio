import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureStudioClean() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'tests', 'screenshots');

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

  // 1. Capture Node Canvas View with New Header & Branding
  await page.screenshot({ path: path.join(outDir, 'verified_live_studio_redesign.png'), fullPage: false });
  console.log('✓ Captured verified_live_studio_redesign.png');

  // 2. Switch to Cinema Director View & Capture
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const dirBtn = buttons.find((b) => b.textContent?.includes('Cinema Director'));
    if (dirBtn) dirBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'workspace_cinema_director.png'), fullPage: false });
  console.log('✓ Captured workspace_cinema_director.png');

  // 3. Switch to Timeline Suite View & Capture
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const timeBtn = buttons.find((b) => b.textContent?.includes('Timeline Suite'));
    if (timeBtn) timeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'workspace_timeline_suite.png'), fullPage: false });
  console.log('✓ Captured workspace_timeline_suite.png');

  // Switch back to Node Canvas
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const canvasBtn = buttons.find((b) => b.textContent?.includes('Node Canvas'));
    if (canvasBtn) canvasBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await browser.close();
}

captureStudioClean().catch(console.error);
