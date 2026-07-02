// Simple login test script
// Run: node test-login.js

const testLogin = async () => {
  const baseURL = 'https://mhfa-six.vercel.app';

  console.log('Testing login flow...\n');

  // Test 1: Check login page loads
  console.log('1. Testing login page...');
  try {
    const loginPage = await fetch(`${baseURL}/login`);
    console.log(`   ✅ Login page: ${loginPage.status}`);
  } catch (err) {
    console.log(`   ❌ Login page failed: ${err.message}`);
  }

  // Test 2: Check auth API endpoint
  console.log('\n2. Testing auth API...');
  try {
    const authAPI = await fetch(`${baseURL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    console.log(`   ✅ Auth API: ${authAPI.status}`);
    const authResponse = await authAPI.json();
    console.log('   Response:', authResponse);
  } catch (err) {
    console.log(`   ❌ Auth API failed: ${err.message}`);
  }

  // Test 3: Check /api/user/me endpoint
  console.log('\n3. Testing user/me API...');
  try {
    const userMe = await fetch(`${baseURL}/api/user/me`);
    console.log(`   ✅ User/me API: ${userMe.status}`);
    const meResponse = await userMe.json();
    console.log('   Response:', meResponse);
  } catch (err) {
    console.log(`   ❌ User/me API failed: ${err.message}`);
  }
};

testLogin();
