import fetch from 'node-fetch';

const testJavaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        System.out.println("Java execution is working!");
    }
}`;

async function testJavaExecution() {
  try {
    console.log('Testing Java code execution...');
    
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'java',
        code: testJavaCode
      })
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.stdout) {
      console.log('✅ Java execution successful!');
      console.log('Output:', result.stdout);
    } else if (result.stderr) {
      console.log('❌ Java execution failed:');
      console.log('Error:', result.stderr);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testJavaExecution();
