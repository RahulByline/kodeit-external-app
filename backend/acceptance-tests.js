import fetch from 'node-fetch';

async function runTest(testName, language, source, stdin, expectedOutput) {
  try {
    console.log(`\n🧪 Test ${testName}:`);
    console.log(`Language: ${language}`);
    console.log(`Source: ${source.replace(/\n/g, '\\n')}`);
    console.log(`Stdin: "${stdin}"`);
    console.log(`Expected: "${expectedOutput}"`);
    
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, source, stdin })
    });

    const result = await response.json();
    
    if (response.ok) {
      const output = result.stdout || result.stderr || '';
      const success = output.includes(expectedOutput);
      
      console.log(`✅ Result: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`Output: "${output.trim()}"`);
      console.log(`Status: ${result.status?.description || 'Unknown'}`);
      
      return success;
    } else {
      console.log(`❌ Error: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running Judge0 Integration Acceptance Tests\n');
  
  const tests = [
    {
      name: 'A - Single input line',
      language: 'python',
      source: 'n = int(input("Enter a number: "))\nprint(n*2)',
      stdin: '7',
      expected: '14'
    },
    {
      name: 'B - Multiple lines',
      language: 'python',
      source: 'a = input().strip()\nb = int(input())\nprint(a, b*b)',
      stdin: 'Alice\n5',
      expected: 'Alice 25'
    },
    {
      name: 'C - Space-separated',
      language: 'python',
      source: 'x, y, z = map(int, input().split())\nprint(x+y+z)',
      stdin: '10 20 30',
      expected: '60'
    },
    {
      name: 'D - Missing stdin (should not crash)',
      language: 'python',
      source: 'try:\n    name = input("Enter your name: ")\nexcept EOFError:\n    name = ""\nprint("Hi", name)',
      stdin: '',
      expected: 'Hi'
    },
    {
      name: 'E - Simple Python without input',
      language: 'python',
      source: 'print("Hello, World!")\nprint("Python is working!")',
      stdin: '',
      expected: 'Hello, World!'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await runTest(test.name, test.language, test.source, test.stdin, test.expected);
    if (success) passed++;
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Judge0 integration is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
  }
}

runAllTests();
