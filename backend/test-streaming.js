import fetch from 'node-fetch';

async function testStreamingChat() {
  try {
    console.log('🧪 Testing streaming chat endpoint...');
    
    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Can you tell me a short story?'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Streaming connection established!');
    console.log('📡 Receiving streamed response...\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let chunkCount = 0;
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'start') {
                console.log('🚀 Stream started');
                console.log(`📅 Timestamp: ${data.timestamp}`);
                console.log(`🏷️  Source: ${data.source}`);
                console.log('📝 Response chunks:\n');
              } else if (data.type === 'chunk') {
                chunkCount++;
                fullResponse += data.content;
                process.stdout.write(data.content); // Print without newline
              } else if (data.type === 'end') {
                console.log('\n\n✅ Stream completed!');
                console.log(`📊 Total chunks received: ${chunkCount}`);
                console.log(`📏 Full response length: ${fullResponse.length} characters`);
                console.log(`📅 Final timestamp: ${data.timestamp}`);
              } else if (data.type === 'error') {
                console.error('❌ Stream error:', data.error);
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('❌ Streaming test failed:', error.message);
    console.log('💡 Make sure the backend is running: npm run dev');
  }
}

// Run test
console.log('🚀 My AI Buddy - Streaming Test\n');
testStreamingChat(); 