/**
 * PackPal End-to-End API Integration Test Suite
 * Tests live endpoints running on http://localhost:3000
 */

const assert = require('assert');

async function run() {
  console.log('🚀 Running PackPal End-to-End Live API Tests on http://localhost:3000...\n');

  // ─── 1. Test /api/weather ──────────────────────────────────
  console.log('1️⃣ Testing GET /api/weather?destination=Goa...');
  const weatherRes = await fetch('http://localhost:3000/api/weather?destination=Goa');
  assert.strictEqual(weatherRes.status, 200, 'Weather endpoint should return 200');
  const weatherData = await weatherRes.json();
  assert(weatherData.weather, 'Weather payload must contain weather object');
  console.log('✅ Weather response condition:', weatherData.weather.condition);
  console.log('   Source:', weatherData.weather.source, '\n');

  // ─── 2. Test /api/pack ─────────────────────────────────────
  console.log('2️⃣ Testing POST /api/pack for Goa Getaway (4 days, 7kg, Beach+Hiking+Sightseeing)...');
  const packRes = await fetch('http://localhost:3000/api/pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trip: {
        destination: 'Goa',
        startDate: '2026-10-15',
        endDate: '2026-10-18',
        durationDays: 4,
        tripType: 'vacation',
        activities: ['Beach', 'Hiking', 'Sightseeing'],
      },
      baggageLimitKg: 7,
      includeAudio: false,
    }),
  });

  assert.strictEqual(packRes.status, 200, 'Pack endpoint should return 200');
  const packData = await packRes.json();
  assert(Array.isArray(packData.items), 'Must return array of packing items');
  assert(packData.items.length >= 8, `Expected at least 8 items, got ${packData.items.length}`);

  const categories = new Set(packData.items.map(i => i.category));
  console.log(`✅ Generated ${packData.items.length} items across categories:`, Array.from(categories).join(', '));
  console.log('   Source:', packData.source);
  console.log('   Status:', packData.status, '\n');

  // ─── 3. Test /api/ai/optimize ──────────────────────────────
  console.log('3️⃣ Testing POST /api/ai/optimize (Luggage Weight Optimizer)...');
  const optimizeRes = await fetch('http://localhost:3000/api/ai/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: packData.items,
      baggageLimitKg: 7,
      tripContext: 'Goa, 4 days, vacation, activities: Beach, Hiking, Sightseeing',
    }),
  });

  assert.strictEqual(optimizeRes.status, 200, 'Optimize endpoint should return 200');
  const optData = await optimizeRes.json();
  assert(Array.isArray(optData.recommendations), 'Must return recommendations array');
  console.log(`✅ Received ${optData.recommendations.length} optimization recommendations.`);
  console.log('   First 2 recommendations:', optData.recommendations.slice(0, 2), '\n');

  // ─── 4. Test /api/ai/expense ───────────────────────────────
  console.log('4️⃣ Testing POST /api/ai/expense ("Rahul paid ₹2400 for dinner for everyone")...');
  const members = ['Ansh', 'Rahul', 'Aman', 'Riya'];
  const expRes = await fetch('http://localhost:3000/api/ai/expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Rahul paid ₹2400 for dinner for everyone',
      memberNames: members,
    }),
  });

  assert.strictEqual(expRes.status, 200, 'AI expense extraction endpoint should return 200');
  const expData = await expRes.json();
  assert(expData.extraction, 'Must return extraction object');
  console.log('✅ Extraction result:', expData.extraction);
  assert.strictEqual(expData.extraction.amount, 2400, 'Extracted amount must be 2400');
  assert.strictEqual(expData.extraction.paidBy, 'Rahul', 'Payer must be Rahul');
  assert.strictEqual(expData.extraction.participants.length, 4, 'Participants must include all 4 members');
  console.log('   Share per person: ₹' + (expData.extraction.amount / expData.extraction.participants.length), '\n');

  // ─── 5. Test /api/ai/trip-change ───────────────────────────
  console.log('5️⃣ Testing POST /api/ai/trip-change ("We\'re staying one extra day.")...');
  const changeRes = await fetch('http://localhost:3000/api/ai/trip-change', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changeDescription: "We're staying one extra day.",
      currentTrip: {
        destination: 'Goa',
        startDate: '2026-10-15',
        endDate: '2026-10-18',
        durationDays: 4,
        tripType: 'vacation',
        activities: ['Beach', 'Hiking', 'Sightseeing'],
      },
    }),
  });

  assert.strictEqual(changeRes.status, 200, 'Trip change endpoint should return 200');
  const changeData = await changeRes.json();
  assert(changeData.change, 'Must return change object');
  console.log('✅ Trip change extracted action:', changeData.change);
  assert.strictEqual(changeData.change.action, 'extend_trip', 'Action must be extend_trip');
  assert.strictEqual(changeData.change.days, 1, 'Days extended must be 1\n');

  // ─── 6. Test Invalid Requests for robust error handling ────
  console.log('6️⃣ Testing error handling on invalid requests...');
  const badReq = await fetch('http://localhost:3000/api/weather');
  assert.strictEqual(badReq.status, 400, 'Missing destination should return 400');
  console.log('✅ Correctly handled missing parameters with 400 Bad Request.\n');

  console.log('🎉 ALL LIVE E2E API FLOWS PASSED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('❌ E2E API Test Failed:', err);
  process.exit(1);
});
