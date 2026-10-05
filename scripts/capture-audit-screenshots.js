const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\shrin\\.gemini\\antigravity-ide\\brain\\b8d85bb1-c430-4171-b3ce-2dfccb753735\\screenshots';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const routes = [
  { name: 'home', path: '/' },
  { name: 'trips', path: '/trips' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'settings', path: '/settings' },
  { name: 'about', path: '/about' },
];

console.log('Capturing screenshots for audit...');

for (const r of routes) {
  // Desktop
  const deskFile = path.join(outDir, `${r.name}_1440.png`);
  console.log(`Capturing ${r.name} desktop...`);
  try {
    execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=1440,900 "--screenshot=${deskFile}" "http://localhost:3000${r.path}"`, { timeout: 15000 });
  } catch (e) {
    console.error(`Failed ${r.name} desktop`, e.message);
  }

  // Mobile
  const mobFile = path.join(outDir, `${r.name}_390.png`);
  console.log(`Capturing ${r.name} mobile...`);
  try {
    execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=390,844 "--screenshot=${mobFile}" "http://localhost:3000${r.path}"`, { timeout: 15000 });
  } catch (e) {
    console.error(`Failed ${r.name} mobile`, e.message);
  }
}

console.log('Finished capturing base routes.');
