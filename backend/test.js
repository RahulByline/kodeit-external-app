import axios from 'axios';

async function testOllamaConnection() {
  try {
    console.log('🧪 Testing Ollama connection...');
    
    // Test if Ollama is running
    const response = await axios.get('http://localhost:11434/api/tags');
    console.log('✅ Ollama is running!');
    console.log('📋 Available models:', response.data.models?.map(m => m.name) || 'No models found');
    
    // Test if Mistral model is available
    const models = response.data.models || [];
    const mistralAvailable = models.some(model => model.name.includes('mistral'));
    
    if (mistralAvailable) {
      console.log('✅ Mistral model is available!');
    } else {
      console.log('⚠️  Mistral model not found. Please run: ollama pull mistral');
    }
    
  } catch (error) {
    console.error('❌ Ollama connection failed:', error.message);
    console.log('💡 Make sure Ollama is running: ollama serve');
  }
}

async function testBackendEndpoint() {
  try {
    console.log('\n🧪 Testing backend endpoint...');
    
    const response = await axios.post('http://localhost:5000/chat', {
      message: 'Hello, this is a test message!'
    });
    
    console.log('✅ Backend is working!');
    console.log('🤖 AI Response:', response.data.response.substring(0, 100) + '...');
    console.log('📅 Timestamp:', response.data.timestamp);
    console.log('🏷️  Source:', response.data.source);
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('💡 Make sure the backend is running: npm run dev');
  }
}

// Run tests
console.log('🚀 My AI Buddy - Connection Tests\n');
testOllamaConnection().then(() => {
  setTimeout(testBackendEndpoint, 1000);
}); 