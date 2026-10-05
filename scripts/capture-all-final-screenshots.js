const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\shrin\\.gemini\\antigravity-ide\\brain\\b8d85bb1-c430-4171-b3ce-2dfccb753735\\screenshots';

const tripRoutes = [
  { name: 'trip_overview', path: '/trips/demo-trip' },
  { name: 'packing', path: '/trips/demo-trip/packing' },
  { name: 'itinerary', path: '/trips/demo-trip/itinerary' },
  { name: 'travelers', path: '/trips/demo-trip/members' },
  { name: 'expenses', path: '/trips/demo-trip/expenses' },
  { name: 'trips_list', path: '/trips' },
  { name: 'settings_final', path: '/settings' },
];

console.log('Capturing all trip routes...');

for (const r of tripRoutes) {
  const deskFile = path.join(outDir, `${r.name}_1440.png`);
  console.log(`Capturing ${r.name} 1440...`);
  try {
    execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=2000 --window-size=1440,900 "--screenshot=${deskFile}" "http://localhost:3000${r.path}"`, { timeout: 12000 });
  } catch (e) {
    console.error(`Failed ${r.name} desk:`, e.message);
  }

  const mobFile = path.join(outDir, `${r.name}_390.png`);
  console.log(`Capturing ${r.name} 390...`);
  try {
    execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=2000 --window-size=390,844 "--screenshot=${mobFile}" "http://localhost:3000${r.path}"`, { timeout: 12000 });
  } catch (e) {
    console.error(`Failed ${r.name} mob:`, e.message);
  }
}

console.log('Finished capturing all final trip screens!');
