import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'tests', 'screenshots');

  console.log('Launching browser with edge path:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Capture Onboarding Walkthrough Modal (opens on first load)
  console.log('Capturing 02_onboarding_walkthrough.png ...');
  await page.screenshot({
    path: path.join(outDir, '02_onboarding_walkthrough.png'),
    fullPage: false,
  });

  // Dismiss Walkthrough Modal by clicking Get Started
  console.log('Dismissing Walkthrough modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent?.includes('Get Started') || b.textContent?.includes('Dismiss'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // 2. Capture Clean Obsidian Canvas Workspace
  console.log('Capturing 01_canvas_workspace.png ...');
  await page.screenshot({
    path: path.join(outDir, '01_canvas_workspace.png'),
    fullPage: false,
  });

  // 3. Capture Cinematic Camera Controls Node
  console.log('Capturing 03_cinematic_camera_controls.png ...');
  const cameraHandle = await page.evaluateHandle(() => {
    const nodes = Array.from(document.querySelectorAll('.react-flow__node'));
    return nodes.find((n) => n.textContent?.includes('Cinematic Camera')) || nodes[1] || nodes[0];
  });
  if (cameraHandle.asElement()) {
    await cameraHandle.asElement().screenshot({
      path: path.join(outDir, '03_cinematic_camera_controls.png'),
    });
  }

  // 4. Capture Timeline & Audio Beats
  console.log('Capturing 04_timeline_audio_beats.png ...');
  const timelineHandle = await page.evaluateHandle(() => {
    return document.querySelector('.h-60') || document.querySelector('.bg-\\[\\#0B0E14\\].border-t');
  });
  if (timelineHandle.asElement()) {
    await timelineHandle.asElement().screenshot({
      path: path.join(outDir, '04_timeline_audio_beats.png'),
    });
  }

  console.log('All screenshots captured successfully to tests/screenshots/ !');
  await browser.close();
}

capture().catch((err) => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
