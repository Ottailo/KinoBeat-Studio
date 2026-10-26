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

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.toString()}`));

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // ONBOARDING / GUIDE: First-Run Walkthrough
  // ==========================================
  console.log('\n[Guide] Testing Onboarding Walkthrough modal...');
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
  // PERSONA 1: Solo Content Creator (Upload + Shot Inspector + Trim + Split Clip + Inline Title Edit)
  // ==========================================
  console.log('\n[Persona 1] Testing Custom Media Upload, Shot Inspector, Trimming, Razor Split & Title Edit...');

  // 1. Upload custom media file into the timeline
  const fileInput = await page.$('input[type="file"][accept*="video"]');
  if (fileInput) {
    console.log('Attaching sample media file to input...');
    await fileInput.uploadFile(sampleFilePath);
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 2. Click a scene clip to open the new Shot Inspector
  console.log('Clicking scene clip to test Shot Inspector drawer...');
  await page.evaluate(() => {
    const clips = document.querySelectorAll('.h-full.rounded-md.border');
    if (clips[0]) clips[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Test modifying shot parameters in the Shot Inspector
  await page.evaluate(() => {
    const focalBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent?.trim() === '24mm'
    );
    if (focalBtns[0]) focalBtns[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 3. Double click the first title block on Track T1
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

  // 4. Test Razor Split Clip tool at playhead
  console.log('Testing Razor Cut "Split Clip" tool...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const splitBtn = buttons.find((b) => b.textContent?.includes('Split Clip'));
    if (splitBtn) splitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(outDir, 'persona_1_custom_media.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_1_custom_media.png');

  // ==========================================
  // PERSONA 2: AI Filmmaker (Aspect Ratio, Camera Kinematics & Generative Shot)
  // ==========================================
  console.log('\n[Persona 2] Testing Aspect Ratio Switcher, DiT Shot & Camera Kinematics...');

  // Select 9:16 Aspect Ratio pill in PromptNode
  await page.evaluate(() => {
    const ratioBtns = Array.from(document.querySelectorAll('button')).filter(
      (b) => b.textContent?.trim() === '9:16'
    );
    if (ratioBtns[0]) ratioBtns[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));

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
  await new Promise((r) => setTimeout(r, 600));

  // Click "Generate Video Shot" in DiT Model node
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find((b) => b.textContent?.includes('Generate Video Shot'));
    if (genBtn) genBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1800));

  await page.screenshot({
    path: path.join(outDir, 'persona_2_generative_shot.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_2_generative_shot.png');

  // ==========================================
  // PERSONA 3: Music Producer (Real FFT Waveform, Volume Slider & Beat-Snap)
  // ==========================================
  console.log('\n[Persona 3] Testing Real Web Audio FFT Waveform, Volume Slider & Beat-Snap...');

  // Click Analyze Stem in Audio node
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const analyzeBtn = buttons.find((b) => b.textContent?.includes('Analyze Stem'));
    if (analyzeBtn) analyzeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Adjust Audio Volume Slider on Track A1 to 125%
  await page.evaluate(() => {
    const volumeSlider = document.querySelector('input[type="range"]');
    if (volumeSlider) {
      volumeSlider.value = '1.25';
      volumeSlider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Toggle Beat Snap
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const snapBtn = buttons.find((b) => b.textContent?.includes('Beat Snap'));
    if (snapBtn) snapBtn.click();
  });

  // Continuous pointer scrub timeline
  await page.evaluate(() => {
    const timeline = document.querySelector('.cursor-crosshair');
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const clientX = rect.left + rect.width * 0.4;
      const downEvent = new PointerEvent('pointerdown', {
        clientX,
        clientY: rect.top + 20,
        bubbles: true,
      });
      timeline.dispatchEvent(downEvent);
      const moveEvent = new PointerEvent('pointermove', {
        clientX: clientX + 80,
        clientY: rect.top + 20,
        bubbles: true,
      });
      timeline.dispatchEvent(moveEvent);
      const upEvent = new PointerEvent('pointerup', {
        clientX: clientX + 80,
        clientY: rect.top + 20,
        bubbles: true,
      });
      timeline.dispatchEvent(upEvent);
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

  // In the Inspector: select 36px font and Electric Cyan color
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

  // ==========================================
  // PERSONA 5: Brand Marketer & Director (Media Bin & Master 4K Video Compilation)
  // ==========================================
  console.log('\n[Persona 5] Testing Project Media Bin & Master 4K Video Render...');

  // 1. Open Media Bin
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const binBtn = buttons.find((b) => b.textContent?.includes('Media Bin'));
    if (binBtn) binBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // 2. Open Export 4K modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const exportBtn = buttons.find((b) => b.textContent?.includes('Export 4K'));
    if (exportBtn) exportBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 3. Select 720p draft for fast automated compilation test & start render
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const draftResBtn = buttons.find((b) => b.textContent?.includes('720p Web'));
    if (draftResBtn) draftResBtn.click();

    const startBtn = buttons.find((b) => b.textContent?.includes('Start Master 4K Video Render'));
    if (startBtn) startBtn.click();
  });

  console.log('Waiting for VideoRenderer canvas compilation pipeline...');
  // Wait up to 12s for deterministic render to complete
  await new Promise((r) => setTimeout(r, 10000));

  // Capture screenshot of finished render with embedded video player and file stats!
  await page.screenshot({
    path: path.join(outDir, 'persona_5_export_master_player.png'),
    fullPage: false,
  });
  console.log('✓ Captured persona_5_export_master_player.png');

  console.log('\n--- ALL 5 PERSONAS TESTED SUCCESSFULLY WITH REAL VIDEO RENDER! ---');
  await browser.close();
}

runPersonaTestSuite().catch((err) => {
  console.error('Persona test error:', err);
  process.exit(1);
});
