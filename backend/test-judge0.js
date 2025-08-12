import fetch from 'node-fetch';

async function testJudge0() {
  try {
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: 'python',
        source: 'n = int(input("Enter a number: "))\nprint(n*2)',
        stdin: '7'
      })
    });

    const result = await response.json();
    console.log('Test Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testJudge0();
