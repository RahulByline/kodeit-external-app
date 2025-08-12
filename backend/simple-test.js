import axios from 'axios';

async function simpleTest() {
  try {
    console.log('🧪 Simple test - checking backend health...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test JavaScript execution
    console.log('\n🧪 Testing JavaScript execution...');
    const jsResponse = await axios.post('http://localhost:5000/api/run', {
      language: 'javascript',
      code: 'console.log("Hello from JavaScript!");'
    }, {
      timeout: 10000
    });
    
    console.log('✅ JavaScript test result:', {
      exitCode: jsResponse.data.exitCode,
      stdout: jsResponse.data.stdout?.trim(),
      stderr: jsResponse.data.stderr?.trim()
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

simpleTest();
