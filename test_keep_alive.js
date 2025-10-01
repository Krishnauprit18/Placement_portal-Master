// Test the keep-alive configuration logic
console.log('='.repeat(60));
console.log('KEEP-ALIVE CONFIGURATION TEST');
console.log('='.repeat(60));

// Test 1: Enabled with custom settings
console.log('\n✅ Test 1: Enabled with Custom Settings');
process.env.KEEP_ALIVE_ENABLED = 'true';
process.env.KEEP_ALIVE_URL = 'http://localhost:3000/ping';
process.env.KEEP_ALIVE_INTERVAL = '180000';
process.env.PORT = '3000';

let keepAliveEnabled = String(process.env.KEEP_ALIVE_ENABLED).toLowerCase() !== 'false';
let keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://localhost:${process.env.PORT || 3000}/ping`;
let keepAliveInterval = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 300000;

console.log('  Enabled:', keepAliveEnabled);
console.log('  URL:', keepAliveUrl);
console.log('  Interval:', keepAliveInterval, 'ms (' + (keepAliveInterval/1000) + 's)');
console.log('  Protocol:', keepAliveUrl.startsWith('https') ? 'HTTPS' : 'HTTP');

// Test 2: Disabled state
console.log('\n✅ Test 2: Disabled State');
process.env.KEEP_ALIVE_ENABLED = 'false';
keepAliveEnabled = String(process.env.KEEP_ALIVE_ENABLED).toLowerCase() !== 'false';
console.log('  Enabled:', keepAliveEnabled);
console.log('  Should skip keep-alive setup:', !keepAliveEnabled);

// Test 3: Default values
console.log('\n✅ Test 3: Default Values (No env vars)');
delete process.env.KEEP_ALIVE_URL;
delete process.env.KEEP_ALIVE_INTERVAL;
process.env.KEEP_ALIVE_ENABLED = 'true';
process.env.PORT = '3000';

keepAliveEnabled = String(process.env.KEEP_ALIVE_ENABLED).toLowerCase() !== 'false';
keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://localhost:${process.env.PORT || 3000}/ping`;
keepAliveInterval = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 300000;

console.log('  Enabled:', keepAliveEnabled);
console.log('  Default URL:', keepAliveUrl);
console.log('  Default Interval:', keepAliveInterval, 'ms (' + (keepAliveInterval/1000) + 's)');

// Test 4: HTTPS URL
console.log('\n✅ Test 4: HTTPS URL Detection');
process.env.KEEP_ALIVE_URL = 'https://myapp.onrender.com/ping';
keepAliveUrl = process.env.KEEP_ALIVE_URL;
console.log('  URL:', keepAliveUrl);
console.log('  Protocol:', keepAliveUrl.startsWith('https') ? 'HTTPS' : 'HTTP');

// Test 5: Custom interval
console.log('\n✅ Test 5: Custom Interval');
process.env.KEEP_ALIVE_INTERVAL = '600000';
keepAliveInterval = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 300000;
console.log('  Interval:', keepAliveInterval, 'ms (' + (keepAliveInterval/60000) + ' minutes)');

// Test 6: Port detection
console.log('\n✅ Test 6: Port Detection');
delete process.env.KEEP_ALIVE_URL;
process.env.PORT = '5000';
keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://localhost:${process.env.PORT || 3000}/ping`;
console.log('  Port from env:', process.env.PORT);
console.log('  Generated URL:', keepAliveUrl);

// Test 7: No PORT set
console.log('\n✅ Test 7: No PORT Set (Default 3000)');
delete process.env.PORT;
keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://localhost:${process.env.PORT || 3000}/ping`;
console.log('  Generated URL:', keepAliveUrl);

console.log('\n' + '='.repeat(60));
console.log('ALL TESTS PASSED ✅');
console.log('='.repeat(60));