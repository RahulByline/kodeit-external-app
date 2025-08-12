import fetch from 'node-fetch';

async function testJudge0Direct() {
  try {
    console.log('Testing Judge0 API directly...');
    
    // Test 1: Check if we can reach the languages endpoint
    const languagesUrl = 'https://judge0-ce.p.rapidapi.com/languages';
    console.log('Testing languages endpoint:', languagesUrl);
    
    const response = await fetch(languagesUrl);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const languages = await response.json();
      console.log('Languages found:', languages.length);
      console.log('First few languages:', languages.slice(0, 3));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testJudge0Direct();
