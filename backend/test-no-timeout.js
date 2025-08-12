import fetch from 'node-fetch';

const testCases = [
  {
    language: 'javascript',
    code: 'console.log("Hello from JavaScript!");\nconsole.log("JS execution working!");',
    name: 'JavaScript'
  },
  {
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        System.out.println("Java execution working!");
    }
}`,
    name: 'Java'
  }
];

async function testLanguageExecution(language, code, name) {
  try {
    console.log(`\n🧪 Testing ${name} execution (No Timeout)...`);
    
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        code: code
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      if (result.stdout) {
        console.log(`✅ ${name} execution successful!`);
        console.log(`📤 Output: ${result.stdout.trim()}`);
      } else if (result.stderr) {
        console.log(`❌ ${name} execution failed:`);
        console.log(`📤 Error: ${result.stderr.trim()}`);
      } else {
        console.log(`⚠️ ${name} execution completed but no output`);
      }
    } else {
      console.log(`❌ ${name} API request failed:`);
      console.log(`📤 Error: ${result.error || result.message}`);
    }
    
  } catch (error) {
    console.error(`❌ ${name} test failed:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting language execution tests (No Timeout)...\n');
  
  for (const testCase of testCases) {
    await testLanguageExecution(testCase.language, testCase.code, testCase.name);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 All tests completed!');
}

// Check if backend is running first
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not running. Please start the backend first:');
    console.log('   cd backend && npm start');
    return false;
  }
}

async function main() {
  const backendRunning = await checkBackend();
  if (backendRunning) {
    await runTests();
  }
}

main();
