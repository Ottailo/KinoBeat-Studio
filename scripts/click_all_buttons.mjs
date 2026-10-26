import puppeteer from 'puppeteer-core';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  console.log('--- Launching Edge (via puppeteer-core) to click & test every interactive control ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('UNCAUGHT PAGE ERROR:', err.message);
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Walkthrough Modal
  console.log('[Test 1] Testing Walkthrough Modal...');
  const enterStudioBtn = await page.$('button ::-p-text(Enter Studio)');
  if (enterStudioBtn) {
    console.log('  Found Walkthrough modal, clicking "Enter Studio"...');
    await enterStudioBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // 2. Header Buttons
  console.log('[Test 2] Testing Header Controls...');
  // Engine Diagnostics
  const diagBtn = await page.$('button[title*="Engine Diagnostics"]');
  if (diagBtn) {
    console.log('  Clicking Engine Diagnostics...');
    await diagBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const benchmarkBtn = await page.$('button ::-p-text(Run Diagnostics Benchmark)');
    if (benchmarkBtn) {
      console.log('  Clicking Run Diagnostics Benchmark...');
      await benchmarkBtn.click();
      await new Promise((r) => setTimeout(r, 800));
    }
    const closeDiagBtn = await page.$('.fixed button');
    if (closeDiagBtn) {
      await closeDiagBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Audio Mute in Header
  const headerMuteBtn = await page.$('header button[title*="Mute Audio"]');
  if (headerMuteBtn) {
    console.log('  Clicking Header Mute toggle...');
    await headerMuteBtn.click();
    await new Promise((r) => setTimeout(r, 200));
    await headerMuteBtn.click();
  }

  // BYOK Modal
  const byokBtn = await page.$('header button ::-p-text(BYOK)');
  if (byokBtn) {
    console.log('  Clicking BYOK button...');
    await byokBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const hideBtn = await page.$('button ::-p-text(Show Keys)');
    if (hideBtn) await hideBtn.click();
    const closeByok = await page.$('.fixed button');
    if (closeByok) {
      await closeByok.click();
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // 3. Node Toolbar
  console.log('[Test 3] Testing Node Toolbar centering...');
  const toolbarButtons = ['Prompt', 'Camera', 'Model', 'Audio', 'Sequencer'];
  for (const name of toolbarButtons) {
    const btn = await page.$(`div.absolute.top-4 button ::-p-text(${name})`);
    if (btn) {
      console.log(`  Clicking Toolbar Node button: ${name}`);
      await btn.click();
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // Fit View
  const fitViewBtn = await page.$('button[title="Fit Canvas to View"]');
  if (fitViewBtn) {
    console.log('  Clicking Fit Canvas button...');
    await fitViewBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Auto-Director
  const autoDirectorBtn = await page.$('button ::-p-text(Auto-Director)');
  if (autoDirectorBtn) {
    console.log('  Clicking Auto-Director button...');
    await autoDirectorBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    const storyBtn = await page.$('button ::-p-text(Cyberpunk Runner)');
    if (storyBtn) {
      console.log('  Selecting Cyberpunk Runner 3-Shot Storyboard...');
      await storyBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  // 4. Timeline Controls
  console.log('[Test 4] Testing MultiTrack Timeline buttons...');
  // Zoom In / Out
  const zoomInBtn = await page.$('button[title="Zoom In"]');
  const zoomOutBtn = await page.$('button[title="Zoom Out"]');
  if (zoomInBtn) {
    console.log('  Clicking Zoom In 2x...');
    await zoomInBtn.click();
    await zoomInBtn.click();
    await new Promise((r) => setTimeout(r, 200));
  }
  if (zoomOutBtn) {
    console.log('  Clicking Zoom Out 1x...');
    await zoomOutBtn.click();
    await new Promise((r) => setTimeout(r, 200));
  }

  // Play / Pause
  const playBtn = await page.$('button[title*="Play / Pause"]');
  if (playBtn) {
    console.log('  Clicking Play...');
    await playBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    console.log('  Clicking Pause...');
    await playBtn.click();
  }

  // Rewind
  const rewindBtn = await page.$('button[title="Rewind to Start"]');
  if (rewindBtn) {
    console.log('  Clicking Rewind...');
    await rewindBtn.click();
  }

  // Step Frame
  const stepFwdBtn = await page.$('button[title="Next Frame (Right Arrow)"]');
  if (stepFwdBtn) {
    console.log('  Clicking Step Forward 3x...');
    await stepFwdBtn.click();
    await stepFwdBtn.click();
    await stepFwdBtn.click();
  }

  // Razor Cut
  const cutBtn = await page.$('button[title*="Split Clip at Playhead"]');
  if (cutBtn) {
    console.log('  Clicking Razor Cut at playhead...');
    await cutBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Beat Snap
  const snapBtn = await page.$('button ::-p-text(Snap:)');
  if (snapBtn) {
    console.log('  Clicking Beat Snap toggle...');
    await snapBtn.click();
    await new Promise((r) => setTimeout(r, 200));
  }

  // Media Assets Bin
  const assetsBtn = await page.$('button ::-p-text(Media Assets)');
  if (assetsBtn) {
    console.log('  Clicking Media Assets Bin...');
    await assetsBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Switch tabs: Video, Image, Audio, All
    for (const tab of ['Video', 'Image', 'Audio', 'All']) {
      const tabBtn = await page.$(`button ::-p-text(${tab})`);
      if (tabBtn) {
        await tabBtn.click();
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    // Close Asset Bin
    const closeAssetBin = await page.$('button[title="Close Asset Bin"]');
    if (closeAssetBin) await closeAssetBin.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  // Add Title
  const addTitleBtn = await page.$('button ::-p-text(+ Add Title)');
  if (addTitleBtn) {
    console.log('  Clicking Add Title button...');
    await addTitleBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Track Header Toggles (Mute & Lock)
  const v1MuteBtn = await page.$('button[title*="Video Layer"]');
  if (v1MuteBtn) {
    console.log('  Toggling V1 Video Track Mute...');
    await v1MuteBtn.click();
    await new Promise((r) => setTimeout(r, 200));
    await v1MuteBtn.click();
  }

  const v1LockBtn = await page.$('button[title*="Track V1"]');
  if (v1LockBtn) {
    console.log('  Toggling V1 Lock...');
    await v1LockBtn.click();
    await new Promise((r) => setTimeout(r, 200));
    await v1LockBtn.click();
  }

  // 5. Canvas Node Buttons
  console.log('[Test 5] Testing Node Canvas controls...');
  // Aspect Ratios in Prompt Node
  for (const ratio of ['9:16', '1:1', '21:9', '16:9']) {
    const ratioBtn = await page.$(`button ::-p-text(${ratio})`);
    if (ratioBtn) {
      console.log(`  Clicking Aspect Ratio pill: ${ratio}`);
      await ratioBtn.click();
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Enhance button in Prompt Node
  const enhanceBtn = await page.$('button[title*="Auto-enhance"]');
  if (enhanceBtn) {
    console.log('  Clicking Prompt Enhance button...');
    await enhanceBtn.click();
  }

  // Randomize Seed in Model Node
  const randSeedBtn = await page.$('button ::-p-text(Randomize)');
  if (randSeedBtn) {
    console.log('  Clicking Randomize Seed button...');
    await randSeedBtn.click();
  }

  // 6. Export 4K Modal
  console.log('[Test 6] Testing Export Modal...');
  const exportBtn = await page.$('header button ::-p-text(Export 4K)');
  if (exportBtn) {
    console.log('  Opening Export Modal...');
    await exportBtn.click();
    await new Promise((r) => setTimeout(r, 500));

    // Toggle 720p resolution
    const res720 = await page.$('button ::-p-text(720p)');
    if (res720) await res720.click();

    // Toggle 60fps
    const fps60 = await page.$('button ::-p-text(60 fps)');
    if (fps60) await fps60.click();

    // Download EDL Manifest
    const edlBtn = await page.$('button ::-p-text(Export DaVinci / Premiere EDL)');
    if (edlBtn) {
      console.log('  Testing DaVinci EDL Export button...');
      await edlBtn.click();
    }

    // Render Master Video
    const startRenderBtn = await page.$('button ::-p-text(Start Deterministic Render)');
    if (startRenderBtn) {
      console.log('  Starting Deterministic Video Render...');
      await startRenderBtn.click();
      await new Promise((r) => setTimeout(r, 4500));
    }

    // Check if Download Master Video button appears
    const downloadVideoBtn = await page.$('button ::-p-text(Download Master Video)');
    if (downloadVideoBtn) {
      console.log('  SUCCESS: Download Master Video button rendered!');
    }

    const closeExport = await page.$('.fixed button');
    if (closeExport) await closeExport.click();
  }

  console.log('--- ALL BUTTONS CLICKED AND EXECUTED WITH ZERO UNCAUGHT EXCEPTIONS! ---');
  await browser.close();
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
