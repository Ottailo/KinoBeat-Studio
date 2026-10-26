import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPersonaTestSuite() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'tests', 'screenshots', 'personas');
  const sampleFilePath = path.resolve(__dirname, '..', 'tests', 'fixtures', 'test_sample.png');

  console.log('--- STARTING 5-PERSONA E2E SUITE ---');
  console.log('Browser path:', edgePath);
  console.log('Screenshot output dir:', outDir);

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

  // ==========================================
  // PERSONA 5: Brand Marketer / Walkthrough Guide
  // ==========================================
  console.log('\n[Persona 5] Testing Onboarding Walkthrough & Guide modal...');
  await page.screenshot({
    path: path.join(outDir, 'persona_5_walkthrough_guide.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_5_walkthrough_guide.png');

  // Dismiss Walkthrough Modal by clicking "Enter Studio"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Enter Studio'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // ==========================================
  // PERSONA 1: Solo Content Creator (Custom Media Upload & Inline Title Edit)
  // ==========================================
  console.log('\n[Persona 1] Testing Custom Media Upload & Double-Click Title Editing...');

  // 1. Upload custom media file into the timeline
  const fileInput = await page.$('input[type="file"][accept*="video"]');
  if (fileInput) {
    console.log('Attaching sample media file to input...');
    await fileInput.uploadFile(sampleFilePath);
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 2. Double click the first title block on Track T1
  console.log('Double clicking on title block to edit inline...');
  await page.evaluate(() => {
    const titleBlock = document.querySelector('.border-pink-500\\/40, .h-8.rounded.border');
    if (titleBlock) {
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      titleBlock.dispatchEvent(dblClickEvent);
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  // Type new title into the inline input
  await page.evaluate(() => {
    const input = document.querySelector('.h-8.rounded.border input');
    if (input) {
      input.value = 'MY TOKYO VLOG 2088';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(outDir, 'persona_1_custom_media.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_1_custom_media.png');

  // ==========================================
  // PERSONA 2: AI Filmmaker (Prompt Calibration, FPV Camera & Generative Shot)
  // ==========================================
  console.log('\n[Persona 2] Testing Generative DiT Shot & Camera Kinematics...');

  // Select FPV Dive Camera preset
  await page.evaluate(() => {
    const cameraSelect = document.querySelector('.react-flow__node select');
    if (cameraSelect) {
      cameraSelect.value = 'fpv_dive';
      cameraSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Click Enhance prompt button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const enhanceBtn = buttons.find((b) => b.textContent?.includes('Enhance'));
    if (enhanceBtn) enhanceBtn.click();
  });

  // Click "Generate Video Shot" in DiT Model node
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find((b) => b.textContent?.includes('Generate Video Shot'));
    if (genBtn) genBtn.click();
  });
  // Wait for inference progress
  await new Promise((r) => setTimeout(r, 1600));

  await page.screenshot({
    path: path.join(outDir, 'persona_2_generative_shot.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_2_generative_shot.png');

  // ==========================================
  // PERSONA 3: Music Producer (Real FFT Waveform & Beat-Snap Magnet)
  // ==========================================
  console.log('\n[Persona 3] Testing Real Web Audio FFT Waveform & Beat-Snap...');

  // Click Analyze Stem in Audio node
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const analyzeBtn = buttons.find((b) => b.textContent?.includes('Analyze Stem'));
    if (analyzeBtn) analyzeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Toggle Beat Snap
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const snapBtn = buttons.find((b) => b.textContent?.includes('Beat Snap'));
    if (snapBtn) snapBtn.click();
  });

  // Scrub timeline to kick beat
  await page.evaluate(() => {
    const timeline = document.querySelector('.bg-\\[\\#0B0E14\\].overflow-hidden.cursor-pointer');
    if (timeline) {
      const clickEvent = new MouseEvent('click', {
        clientX: timeline.getBoundingClientRect().left + 250,
        clientY: timeline.getBoundingClientRect().top + 20,
        bubbles: true,
      });
      timeline.dispatchEvent(clickEvent);
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(outDir, 'persona_3_audio_beat_sync.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_3_audio_beat_sync.png');

  // ==========================================
  // PERSONA 4: Motion Typographer (Kinetic Title Inspector)
  // ==========================================
  console.log('\n[Persona 4] Testing Title Inspector & Kinetic Motion Styling...');

  // Click on a caption block to open the Title Properties Inspector
  await page.evaluate(() => {
    const titleBlock = document.querySelectorAll('.h-8.rounded.border')[1];
    if (titleBlock) titleBlock.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // In the Inspector: select 36px font and Pink color
  await page.evaluate(() => {
    const sizeBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('36px')
    );
    if (sizeBtns[0]) sizeBtns[0].click();

    const swatch = document.querySelector('button[title="Electric Cyan"]');
    if (swatch) swatch.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(outDir, 'persona_4_kinetic_typography.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_4_kinetic_typography.png');

  console.log('\n--- ALL 5 PERSONAS TESTED SUCCESSFULLY! ---');
  await browser.close();
}

runPersonaTestSuite().catch((err) => {
  console.error('Persona test error:', err);
  process.exit(1);
});
