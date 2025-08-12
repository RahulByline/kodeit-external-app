import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';
import os from 'os';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import blocklyRoutes from './routes/blockly.routes.js';
// Note: Using native fetch (available in Node.js 18+)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: "200kb" }));

// CORS middleware
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ 
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60_000,
  limit: Number(process.env.RATE_LIMIT_PER_MINUTE || 60)
});
app.use(limiter);

// Judge0 configuration
const JUDGE0 = process.env.JUDGE0_URL || "http://localhost:2358";

// Judge0 CE language IDs (v1.13+). Updated for better compatibility.
const LANG = {
  javascript: 63, // Node.js
  python: 71,     // Python 3.x
  c: 50,          // GCC C
  cpp: 54,        // GCC C++
  java: 62        // Java OpenJDK
};

// Helper function to get language labels
function getLanguageLabel(language) {
  const labels = {
    javascript: 'Node.js',
    python: 'Python',
    java: 'Java JDK',
    c: 'GCC C Compiler',
    cpp: 'GCC C++ Compiler'
  };
  return labels[language] || language;
}

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

// Code Execution Function
async function runCode(language, code) {
  const tempDir = path.join(os.tmpdir(), `code-${uuid()}`);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    let fileName, command, args;
    
    switch (language) {
      case 'javascript':
        fileName = 'main.js';
        command = 'node';
        args = ['main.js'];
        break;
      case 'python':
        fileName = 'main.py';
        command = 'python';
        args = ['main.py'];
        break;
      case 'java':
        fileName = 'Main.java';
        command = 'javac';
        args = ['Main.java'];
        break;
      case 'c':
        fileName = 'main.c';
        command = 'gcc';
        args = ['main.c', '-o', 'main.exe'];
        break;
      case 'cpp':
        fileName = 'main.cpp';
        command = 'g++';
        args = ['main.cpp', '-o', 'main.exe'];
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    // Java-specific paths
    const javaPaths = {
      javac: 'C:\\Program Files\\Microsoft\\jdk-17.0.16.8-hotspot\\bin\\javac.exe',
      java: 'C:\\Program Files\\Microsoft\\jdk-17.0.16.8-hotspot\\bin\\java.exe'
    };

    // Check if command is available
    let commandPath = command;
    if (language === 'java') {
      commandPath = javaPaths.javac;
      // Check if Java is available
      try {
        await fs.access(javaPaths.javac);
        await fs.access(javaPaths.java);
        console.log('✅ Java JDK found at:', javaPaths.javac);
      } catch (error) {
        console.log('❌ Java JDK not found at expected path:', javaPaths.javac);
        throw new Error(`Java JDK is not installed or not found at expected path. Please install Java JDK to run Java code.`);
      }
    } else {
      try {
        const { execSync } = await import('child_process');
        execSync(`where ${command}`, { stdio: 'ignore' });
      } catch (error) {
        throw new Error(`${getLanguageLabel(language)} is not installed or not in PATH. Please install ${getLanguageLabel(language)} to run ${language} code.`);
      }
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code, { encoding: 'utf8', flag: 'w' });
    
    // Verify file was created and has content
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      throw new Error(`Failed to create file: ${filePath}`);
    }
    
    // Read back the file to verify content
    const fileContent = await fs.readFile(filePath, 'utf8');
    if (!fileContent.trim()) {
      throw new Error(`File was created but is empty: ${filePath}`);
    }
    
    console.log(`Created file: ${filePath}`);
    console.log(`File content length: ${fileContent.length} characters`);
    console.log(`Working directory: ${tempDir}`);
    
    // Give file system time to sync
    await new Promise(resolve => setTimeout(resolve, 200));

    return new Promise(async (resolve, reject) => {
      try {
        if (language === 'java') {
          // Compile Java
          console.log('Starting Java compilation...');
          const compileResult = await new Promise((compileResolve, compileReject) => {
            const compileChild = spawn(javaPaths.javac, ['Main.java'], { 
              cwd: tempDir,
              stdio: ['pipe', 'pipe', 'pipe']
            });

            let compileStdout = '';
            let compileStderr = '';

            compileChild.stdout.on('data', (data) => {
              compileStdout += data.toString();
            });

            compileChild.stderr.on('data', (data) => {
              compileStderr += data.toString();
            });

            compileChild.on('close', (code) => {
              console.log('Java compilation completed with code:', code);
              console.log('Java compilation stderr:', compileStderr);
              console.log('Java compilation stdout:', compileStdout);
              compileResolve({
                stdout: compileStdout,
                stderr: compileStderr,
                exitCode: code
              });
            });

            compileChild.on('error', (error) => {
              console.log('Java compilation error:', error);
              compileReject(error);
            });
          });

          if (compileResult.exitCode !== 0) {
            console.log('Java compilation failed with exit code:', compileResult.exitCode);
            console.log('Java compilation stderr:', compileResult.stderr);
            console.log('Java compilation stdout:', compileResult.stdout);
            resolve({
              stdout: compileResult.stdout,
              stderr: compileResult.stderr,
              exitCode: compileResult.exitCode,
              diagnostics: []
            });
            return;
          }

          // Run compiled Java
          console.log('Starting Java execution...');
          const runChild = spawn(javaPaths.java, ['Main'], { 
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let stdout = '';
          let stderr = '';

          runChild.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          runChild.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          runChild.on('close', (code) => {
            console.log('Java execution completed with code:', code);
            console.log('Java stdout:', stdout);
            console.log('Java stderr:', stderr);
            resolve({
              stdout: stdout,
              stderr: stderr,
              exitCode: code,
              diagnostics: []
            });
          });

          runChild.on('error', (error) => {
            console.log('Java execution error:', error);
            reject(error);
          });

          // Ensure process cleanup
          runChild.on('exit', (code) => {
            console.log('Java process exited with code:', code);
          });

        } else if (language === 'c' || language === 'cpp') {
          // Compile C/C++
          console.log(`Starting ${language.toUpperCase()} compilation...`);
          const compileResult = await new Promise((compileResolve, compileReject) => {
            const compileChild = spawn(command, args, { 
              cwd: tempDir,
              stdio: ['pipe', 'pipe', 'pipe']
            });

            let compileStdout = '';
            let compileStderr = '';

            compileChild.stdout.on('data', (data) => {
              compileStdout += data.toString();
            });

            compileChild.stderr.on('data', (data) => {
              compileStderr += data.toString();
            });

            compileChild.on('close', (code) => {
              console.log(`${language.toUpperCase()} compilation completed with code:`, code);
              compileResolve({
                stdout: compileStdout,
                stderr: compileStderr,
                exitCode: code
              });
            });

            compileChild.on('error', (error) => {
              console.log(`${language.toUpperCase()} compilation error:`, error);
              compileReject(error);
            });
          });

          if (compileResult.exitCode !== 0) {
            console.log(`${language.toUpperCase()} compilation failed with exit code:`, compileResult.exitCode);
            console.log(`${language.toUpperCase()} compilation stderr:`, compileResult.stderr);
            resolve({
              stdout: compileResult.stdout,
              stderr: compileResult.stderr,
              exitCode: compileResult.exitCode,
              diagnostics: []
            });
            return;
          }

          // Run compiled executable
          console.log(`Starting ${language.toUpperCase()} execution...`);
          const runChild = spawn('./main.exe', [], { 
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let stdout = '';
          let stderr = '';

          runChild.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          runChild.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          runChild.on('close', (code) => {
            console.log(`${language.toUpperCase()} execution completed with code:`, code);
            console.log(`${language.toUpperCase()} stdout:`, stdout);
            console.log(`${language.toUpperCase()} stderr:`, stderr);
            resolve({
              stdout: stdout,
              stderr: stderr,
              exitCode: code,
              diagnostics: []
            });
          });

          runChild.on('error', (error) => {
            console.log(`${language.toUpperCase()} execution error:`, error);
            reject(error);
          });

          // Ensure process cleanup
          runChild.on('exit', (code) => {
            console.log(`${language.toUpperCase()} process exited with code:`, code);
          });

        } else {
          // For interpreted languages (JavaScript, Python)
          console.log(`Starting ${language} execution...`);
          const child = spawn(command, args, { 
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true // Use shell for better path resolution
          });

          let stdout = '';
          let stderr = '';

          child.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          child.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          child.on('close', (code) => {
            console.log(`${language} execution completed with exit code:`, code);
            console.log(`${language} stdout:`, stdout);
            console.log(`${language} stderr:`, stderr);
            resolve({
              stdout: stdout,
              stderr: stderr,
              exitCode: code,
              diagnostics: []
            });
          });

          child.on('error', (error) => {
            console.error(`${language} execution error:`, error);
            reject(error);
          });

          // Ensure process cleanup
          child.on('exit', (code) => {
            console.log(`${language} process exited with code:`, code);
          });
        }

        // Removed timeout to prevent execution failures
        // Code execution will complete naturally without artificial time limits

      } catch (error) {
        reject(error);
      }
    });
  } finally {
    // Clean up
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('Failed to clean up temp directory:', err);
    }
  }
}

// Judge0 Proxy Endpoint
app.post('/api/judge0/run', async (req, res) => {
  try {
    console.log('🔍 Judge0 request received:', { 
      language: req.body?.language, 
      sourceLength: req.body?.source?.length,
      timestamp: new Date().toISOString()
    });

    const { language, source, stdin } = req.body || {};
    if (!language || !source) {
      console.log('❌ Missing language or source');
      return res.status(400).json({ error: "Missing 'language' or 'source'." });
    }
    
    const language_id = LANG[language];
    if (!language_id) {
      console.log('❌ Unsupported language:', language);
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    console.log('📡 Connecting to Judge0 at:', JUDGE0);
    console.log('🔧 Language ID:', language_id);

    // Test Judge0 connection first
    try {
      const healthCheck = await axios.get(`${JUDGE0}/languages`, { timeout: 5000 });
      console.log('✅ Judge0 is reachable, available languages:', healthCheck.data.length);
    } catch (healthError) {
      console.log('❌ Judge0 health check failed:', healthError.message);
      console.log('💡 Make sure Judge0 is running: cd infra/judge0 && docker compose up -d');
      return res.status(503).json({ 
        error: "Judge0 service is not available. Please start Judge0 first.",
        details: healthError.message
      });
    }

    // Create submission and wait synchronously for result
    console.log('🚀 Submitting code to Judge0...');
    const { data: sub } = await axios.post(
      `${JUDGE0}/submissions?wait=true`,
      {
        source_code: source,
        language_id,
        stdin: stdin || ""
      },
      { timeout: 30_000 }
    );

    console.log('✅ Judge0 response received:', {
      status: sub.status?.description,
      hasOutput: !!sub.stdout,
      hasErrors: !!sub.stderr,
      hasCompileOutput: !!sub.compile_output
    });

    res.json({
      status: sub.status,            // { id, description }
      stdout: sub.stdout,
      stderr: sub.stderr,
      compile_output: sub.compile_output,
      time: sub.time,
      memory: sub.memory
    });
  } catch (err) {
    console.error('💥 Judge0 execution error:', {
      message: err.message,
      code: err.code,
      response: err.response?.data,
      status: err.response?.status
    });
    
    let errorMessage = "Execution failed";
    if (err.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Judge0. Please ensure Judge0 is running.";
    } else if (err.code === 'ETIMEDOUT') {
      errorMessage = "Judge0 request timed out. Please try again.";
    } else if (err.response?.status === 422) {
      errorMessage = "Invalid code submission. Please check your code.";
    } else {
      errorMessage = err.message || "Execution failed";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: err.response?.data || err.message
    });
  }
});

// Code Editor Endpoints (Legacy - using local execution)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.post('/api/run', async (req, res) => {
  try {
    console.log('🔍 Local execution request received:', { 
      language: req.body?.language, 
      codeLength: req.body?.code?.length,
      timestamp: new Date().toISOString()
    });

    const { language, code } = req.body;
    
    if (!language || !code) {
      console.log('❌ Missing language or code');
      return res.status(400).json({ error: 'Missing language or code' });
    }

    console.log(`🚀 Running ${language} code...`);
    const result = await runCode(language, code);
    console.log(`✅ ${language} execution completed successfully:`, {
      exitCode: result.exitCode,
      hasOutput: !!result.stdout,
      hasErrors: !!result.stderr,
      outputLength: result.stdout?.length || 0
    });
    res.json(result);
  } catch (error) {
    console.error(`💥 Error running ${req.body.language} code:`, {
      message: error.message,
      stack: error.stack,
      language: req.body.language 
    });
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
      language: req.body.language 
    });
  }
});

// Mount Blockly routes
app.use('/api/blockly', blocklyRoutes);

// GET /health endpoint for checking if server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 My AI Buddy Backend running on http://localhost:${PORT}`);
  console.log(`📡 Ready to communicate with Ollama at http://localhost:11434`);
  console.log(`💻 Legacy Code Editor API available at http://localhost:${PORT}/api/run`);
  console.log(`⚡ Judge0 Proxy API available at http://localhost:${PORT}/api/judge0/run`);
}); 