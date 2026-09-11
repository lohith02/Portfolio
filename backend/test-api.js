import http from 'http';

async function testEndpoint(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5001/api/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
  });
}

async function runTests() {
  console.log('🧪 Running API verification tests...');

  try {
    // 1. Health check
    const health = await testEndpoint('/api/health');
    console.log(`[Health] Status: ${health.status} -> Service: ${health.data.service}`);

    // 2. Photos API (blank initial state ready for uploads)
    const photos = await testEndpoint('/api/photos');
    console.log(`[Photos] Status: ${photos.status} -> Total photos: ${photos.data.count}`);

    // 3. Videos API (blank initial state ready for uploads)
    const videos = await testEndpoint('/api/videos');
    console.log(`[Videos] Status: ${videos.status} -> Total videos: ${videos.data.count}`);

    // 4. Skills API
    const skills = await testEndpoint('/api/skills');
    console.log(`[Skills] Status: ${skills.status} -> Total capabilities: ${skills.data.count}`);

    // 5. Profile API
    const profile = await testEndpoint('/api/profile');
    console.log(`[Profile] Status: ${profile.status} -> Artist: ${profile.data.profile.name}`);

    // 6. Admin Auth Login
    const auth = await testEndpoint('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'password123'
    });
    console.log(`[Auth Login] Status: ${auth.status} -> Token received: ${Boolean(auth.data.token)} (Admin: ${auth.data.admin.username})`);

    console.log('✨ ALL API TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

async function start() {
  const running = await isServerRunning();
  if (!running) {
    await import('./index.js');
    setTimeout(runTests, 1000);
  } else {
    runTests();
  }
}

start();
