async function testNewEndpoints() {
  console.log('Testing Destination Scout and Photo endpoints on http://localhost:3000...');

  // 1. Test Destination Scout
  const scoutRes = await fetch('http://localhost:3000/api/destinations/scout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'historical city in Rajasthan' }),
  });
  console.log('Scout HTTP Status:', scoutRes.status);
  const scoutData = await scoutRes.json();
  console.log('Scout Source:', scoutData.source);
  console.log('Scout Suggestions:', scoutData.suggestions?.map((s) => s.destination));

  // 2. Test Destination Image
  const imgRes = await fetch('http://localhost:3000/api/destinations/image?q=Jaipur');
  console.log('Image HTTP Status:', imgRes.status);
  const imgData = await imgRes.json();
  console.log('Image URL:', imgData.url?.slice(0, 60) + '...');
  console.log('Image Source:', imgData.source);

  if (scoutRes.ok && imgRes.ok && scoutData.suggestions?.length > 0 && imgData.url) {
    console.log('✅ ALL NEW ENDPOINTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ Verification failed');
    process.exit(1);
  }
}

testNewEndpoints();
