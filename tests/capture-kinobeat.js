const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');

const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const OUT_DIR = 'C:/Users/Hp/Documents/Projects/KinoBeat-Studio/tests/screenshots/redesign';
fs.mkdirSync(OUT_DIR, { recursive: true });
const PORT = 3026;

console.log('STARTING_NEXT_SERVER...');
const nextProcess = spawn('npx.cmd', ['next', 'start', '-p', PORT.toString()], {
  cwd: 'C:/Users/Hp/Documents/Projects/KinoBeat-Studio',
  shell: true,
  stdio: 'ignore'
});

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error('status ' + res.statusCode));
        });
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw new Error('Timeout waiting for ' + url);
}

(async () => {
  try {
    await waitForServer('http://127.0.0.1:' + PORT);
    console.log('NEXT_SERVER_READY');

    const browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1560, height: 960, deviceScaleFactor: 1.5 });

    // Navigate and dismiss walkthrough upfront
    await page.goto('http://127.0.0.1:' + PORT, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('kinobeat_walkthrough_dismissed', 'true');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // 1. Capture Director View
    await page.screenshot({ path: path.join(OUT_DIR, '01-kinobeat-director.png') });
    console.log('CAPTURED 01-kinobeat-director.png');

    // 2. Switch to Timeline View
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const timelineBtn = btns.find((b) => b.textContent && b.textContent.includes('Timeline'));
      if (timelineBtn) timelineBtn.click();
    });
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT_DIR, '02-kinobeat-timeline.png') });
    console.log('CAPTURED 02-kinobeat-timeline.png');

    // 3. Switch to Nodes Canvas View
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nodesBtn = btns.find((b) => b.textContent && b.textContent.includes('Nodes'));
      if (nodesBtn) nodesBtn.click();
    });
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT_DIR, '03-kinobeat-nodes.png') });
    console.log('CAPTURED 03-kinobeat-nodes.png');

    // 4. Switch to Reels / Showcase View
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reelsBtn = btns.find((b) => b.textContent && b.textContent.includes('Reels'));
      if (reelsBtn) reelsBtn.click();
    });
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT_DIR, '04-kinobeat-reels.png') });
    console.log('CAPTURED 04-kinobeat-reels.png');

    await browser.close();
    console.log('ALL_KINOBEAT_SHOTS_CAPTURED');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    try {
      spawn('taskkill', ['/pid', nextProcess.pid, '/f', '/t']);
    } catch {}
    process.exit(0);
  }
})();
