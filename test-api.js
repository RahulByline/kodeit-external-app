// Test script for your deployed API
// Replace 'yourdomain.com' with your actual domain

const API_BASE = 'https://yourdomain.com/api';

async function testAPI() {
  console.log('🧪 Testing deployed API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    console.log('');

    // Test 2: JavaScript Execution
    console.log('2️⃣ Testing JavaScript Execution...');
    const jsResponse = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'javascript',
        source: 'console.log("Hello from deployed API!");'
      })
    });
    const jsResult = await jsResponse.json();
    console.log('✅ JavaScript Result:', jsResult);
    console.log('');

    // Test 3: Python Execution
    console.log('3️⃣ Testing Python Execution...');
    const pyResponse = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        source: 'print("Hello from Python on deployed API!")'
      })
    });
    const pyResult = await pyResponse.json();
    console.log('✅ Python Result:', pyResult);
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();

