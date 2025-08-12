import fetch from 'node-fetch';

async function testInteractiveInput() {
  try {
    console.log('🧪 Testing Interactive Input...');
    
    // Test 1: Start execution with input() call
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        source: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
        stdin: ''
      })
    });

    const result = await response.json();
    console.log('Initial response:', JSON.stringify(result, null, 2));
    
    if (result.waitingForInput) {
      console.log('✅ Code is waiting for input');
      console.log('Prompt:', result.prompt);
      console.log('Execution ID:', result.executionId);
      
      // Test 2: Send input
      const inputResponse = await fetch('http://localhost:5000/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactive: true,
          executionId: result.executionId,
          stdin: 'John'
        })
      });

      const inputResult = await inputResponse.json();
      console.log('Input response:', JSON.stringify(inputResult, null, 2));
      
    } else {
      console.log('❌ Code did not wait for input');
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testInteractiveInput();
