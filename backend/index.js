import express from 'express';
import cors from 'cors';
import axios from 'axios';
// Note: Using native fetch (available in Node.js 18+)

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory conversation storage (in production, use a database)
const conversations = new Map();

// POST /chat endpoint (streaming)
app.post('/chat', async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    const conversation = conversations.get(conversationId);

    // Add user message to conversation
    conversation.push({ role: 'user', content: message });

    // Prepare messages for Ollama API with system prompt for structured responses
    const systemPrompt = {
      role: 'system',
      content: `You are My AI Buddy, a helpful and knowledgeable assistant. When providing answers, try to structure them in a clear and organized way using these formats when appropriate:

📖 [Title for your response]
✅ [Key point 1]
✅ [Key point 2]
🧠 [Tip or insight]
📎 [Source or reference]

For simple questions, provide direct answers. For complex topics, use the structured format above to make information more digestible and organized. Always be helpful, accurate, and engaging.`
    };

    const messages = [systemPrompt, ...conversation.map(msg => ({
      role: msg.role,
      content: msg.content
    }))];

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send start event
    res.write(`data: ${JSON.stringify({
      type: 'start',
      timestamp: new Date().toISOString(),
      source: 'My AI Buddy (Kodeit)',
      language: 'en',
      conversationId: conversationId
    })}\n\n`);

    let fullResponse = '';

    // Call Ollama API with streaming
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        messages: messages,
        stream: true
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            
            if (data.message?.content) {
              const content = data.message.content;
              fullResponse += content;
              
              // Send chunk to frontend
              res.write(`data: ${JSON.stringify({
                type: 'chunk',
                content: content,
                timestamp: new Date().toISOString()
              })}\n\n`);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Add AI response to conversation
    conversation.push({ role: 'assistant', content: fullResponse });

    // Keep conversation history manageable (last 20 messages)
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }

    // Send end event
    res.write(`data: ${JSON.stringify({
      type: 'end',
      response: fullResponse,
      timestamp: new Date().toISOString(),
      source: 'My AI Buddy (Kodeit)',
      language: 'en',
      conversationId: conversationId
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    
    // Send error event
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Failed to process chat request',
      details: error.message
    })}\n\n`);
    
    res.end();
  }
});

// GET /health endpoint for checking if server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 My AI Buddy Backend running on http://localhost:${PORT}`);
  console.log(`📡 Ready to communicate with Ollama at http://localhost:11434`);
}); 