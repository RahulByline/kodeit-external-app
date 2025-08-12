import 'dotenv/config';
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
import blocklyRoutes from './routes/blockly.routes.js';
// Note: Using native fetch (available in Node.js 18+)

const app = express();
app.use(express.json({ limit: '1mb' }));
const PORT = process.env.PORT || 5000;
const JUDGE0_URL = process.env.JUDGE0_URL?.replace(/\/+$/, '') || 'https://judge0-ce.p.rapidapi.com';

// Security middleware
app.use(helmet());
app.use(express.json({ limit: "200kb" }));

// CORS middleware - Allow any localhost port dynamically
app.use(cors({ 
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60_000,
  limit: Number(process.env.RATE_LIMIT_PER_MINUTE || 60)
});
app.use(limiter);

// Language ID cache and helper
let cachedLangIds = { python3: null };

async function getPython3LanguageId() {
  if (cachedLangIds.python3) return cachedLangIds.python3;
  const r = await fetch(`${JUDGE0_URL}/languages`);
  if (!r.ok) throw new Error(`Failed to fetch languages: ${r.status}`);
  const langs = await r.json();
  const py = langs.find(l => /python/i.test(l.name) && /(^|[^0-9])3([^0-9]|$)/.test(l.name));
  if (!py) throw new Error('Python 3 language not found on Judge0 instance');
  cachedLangIds.python3 = py.id;
  return py.id;
}

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

// In-memory execution storage for interactive input
const activeExecutions = new Map();

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

// Interactive Code Execution Function
async function runCodeInteractive(language, code, executionId) {
  const tempDir = path.join(os.tmpdir(), `code-${executionId}`);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    let fileName, command, args;
    
    switch (language) {
      case 'python':
        fileName = 'main.py';
        command = 'py';
        args = ['main.py'];
        break;
      default:
        throw new Error(`Interactive execution not supported for ${language}`);
    }

    // Check if command is available
    let commandPath = command;
    try {
      const { execSync } = await import('child_process');
      execSync(`where ${command}`, { stdio: 'ignore' });
      console.log(`✅ ${command} found in PATH`);
    } catch (error) {
      // For Python, try alternative commands
      if (language === 'python') {
        try {
          execSync(`where py`, { stdio: 'ignore' });
          console.log('✅ Python (py) found in PATH');
          commandPath = 'py';
        } catch (pyError) {
          try {
            execSync(`where python3`, { stdio: 'ignore' });
            console.log('✅ Python (python3) found in PATH');
            commandPath = 'python3';
          } catch (python3Error) {
            try {
              execSync(`where python`, { stdio: 'ignore' });
              console.log('✅ Python (python) found in PATH');
              commandPath = 'python';
            } catch (pythonError) {
              throw new Error(`Python is not installed or not found in PATH. Please install Python to run Python code.`);
            }
          }
        }
      } else {
        throw new Error(`${getLanguageLabel(language)} is not installed or not in PATH. Please install ${getLanguageLabel(language)} to run ${language} code.`);
      }
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code, { encoding: 'utf8', flag: 'w' });
    
    console.log(`Created file: ${filePath}`);
    console.log(`Working directory: ${tempDir}`);

    return new Promise((resolve, reject) => {
      const child = spawn(commandPath, args, { 
        cwd: tempDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';
      let isWaitingForInput = false;

      // Set up timeout
      const timeout = 30000; // 30 seconds for interactive execution
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000);
        reject(new Error(`Execution timed out after ${timeout}ms`));
      }, timeout);

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`📤 stdout: ${output}`);
        
        // Check if the process is waiting for input
        if (output.includes('Enter') || output.includes('input') || output.includes(':')) {
          isWaitingForInput = true;
        }
      });

      child.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        console.log(`📤 stderr: ${error}`);
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        console.log(`✅ Interactive execution completed with exit code: ${code}`);
        
        // Clean up temp directory
        fs.rm(tempDir, { recursive: true, force: true }).catch(err => 
          console.warn('Failed to clean up temp directory:', err)
        );

        if (isWaitingForInput) {
          // Store execution for later input
          activeExecutions.set(executionId, {
            child,
            promise: new Promise((res, rej) => {
              child.on('close', (finalCode) => {
                res({
                  stdout: stdout,
                  stderr: stderr,
                  exitCode: finalCode,
                  diagnostics: []
                });
              });
              child.on('error', rej);
            })
          });
          
          resolve({
            waitingForInput: true,
            executionId: executionId,
            stdout: stdout,
            stderr: stderr
          });
        } else {
          resolve({
            stdout: stdout,
            stderr: stderr,
            exitCode: code,
            diagnostics: []
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        console.error(`💥 Interactive execution error:`, error);
        reject(error);
      });
    });
  } catch (error) {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('Failed to clean up temp directory:', err);
    }
    throw error;
  }
}

// Code Execution Function
async function runCode(language, code, stdin = '') {
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
        command = 'py'; // Use 'py' for Windows Python
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
        // Try to find Java in PATH as fallback
        try {
          const { execSync } = await import('child_process');
          execSync(`where javac`, { stdio: 'ignore' });
          console.log('✅ Java found in PATH');
          commandPath = 'javac';
        } catch (pathError) {
          throw new Error(`Java JDK is not installed or not found. Please install Java JDK to run Java code.`);
        }
      }
    } else {
      try {
        const { execSync } = await import('child_process');
        execSync(`where ${command}`, { stdio: 'ignore' });
        console.log(`✅ ${command} found in PATH`);
             } catch (error) {
         // For Python, try alternative commands
         if (language === 'python') {
           try {
             execSync(`where py`, { stdio: 'ignore' });
             console.log('✅ Python (py) found in PATH');
             commandPath = 'py';
           } catch (pyError) {
             try {
               execSync(`where python3`, { stdio: 'ignore' });
               console.log('✅ Python (python3) found in PATH');
               commandPath = 'python3';
             } catch (python3Error) {
               try {
                 execSync(`where python`, { stdio: 'ignore' });
                 console.log('✅ Python (python) found in PATH');
                 commandPath = 'python';
               } catch (pythonError) {
                 throw new Error(`Python is not installed or not found in PATH. Please install Python to run Python code.`);
               }
             }
           }
         } else {
           throw new Error(`${getLanguageLabel(language)} is not installed or not in PATH. Please install ${getLanguageLabel(language)} to run ${language} code.`);
         }
       }
    }

         // Preprocess Python code to handle input() calls better
     let processedCode = code;
     if (language === 'python' && code.includes('input(')) {
       // Add a comment to explain the input handling
       processedCode = `# Note: This code uses input() - default value "User" will be provided automatically\n${code}`;
       console.log('🔧 Python code preprocessed for input() handling');
     }
     
     const filePath = path.join(tempDir, fileName);
     await fs.writeFile(filePath, processedCode, { encoding: 'utf8', flag: 'w' });
    
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
            const compileChild = spawn(commandPath, ['Main.java'], { 
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
          const runChild = spawn('java', ['Main'], { 
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
           console.log(`Starting ${language} execution with command: ${commandPath} ${args.join(' ')}`);
           
           // Add timeout for Python execution to prevent infinite loops
           const timeout = language === 'python' ? 10000 : 5000; // 10 seconds for Python, 5 for others
           
                       // Use provided stdin or default for Python input()
            let finalStdin = stdin;
            if (language === 'python' && code.includes('input(') && !stdin) {
              // Provide default input for common input() calls if no stdin provided
              finalStdin = 'User\n'; // Default input for name prompts
              console.log('📝 Python code contains input() - providing default stdin: "User"');
            } else if (stdin) {
              // Ensure stdin ends with newline
              finalStdin = stdin.endsWith('\n') ? stdin : (stdin + '\n');
              console.log('📝 Using provided stdin:', JSON.stringify(stdin));
            }
           
           const child = spawn(commandPath, args, { 
             cwd: tempDir,
             stdio: ['pipe', 'pipe', 'pipe'],
             shell: true // Use shell for better path resolution
           });

           let stdout = '';
           let stderr = '';
           let isResolved = false;

           // Set up timeout
           const timeoutId = setTimeout(() => {
             if (!isResolved) {
               console.log(`${language} execution timed out after ${timeout}ms`);
               child.kill('SIGTERM'); // Try graceful termination first
               
               setTimeout(() => {
                 if (!isResolved) {
                   child.kill('SIGKILL'); // Force kill if still running
                 }
               }, 1000);
               
               isResolved = true;
               resolve({
                 stdout: stdout,
                 stderr: stderr + `\n[Execution timed out after ${timeout}ms]`,
                 exitCode: -1,
                 diagnostics: []
               });
             }
           }, timeout);

                       // Send stdin if provided
            if (finalStdin) {
              child.stdin.write(finalStdin);
              child.stdin.end();
            }

           child.stdout.on('data', (data) => {
             stdout += data.toString();
           });

           child.stderr.on('data', (data) => {
             stderr += data.toString();
           });

           child.on('close', (code) => {
             if (!isResolved) {
               clearTimeout(timeoutId);
               isResolved = true;
               console.log(`${language} execution completed with exit code:`, code);
               console.log(`${language} stdout:`, stdout);
               console.log(`${language} stderr:`, stderr);
               resolve({
                 stdout: stdout,
                 stderr: stderr,
                 exitCode: code,
                 diagnostics: []
               });
             }
           });

           child.on('error', (error) => {
             if (!isResolved) {
               clearTimeout(timeoutId);
               isResolved = true;
               console.error(`${language} execution error:`, error);
               reject(error);
             }
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



// Code Editor Endpoints (Legacy - using local execution)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.post('/api/run', async (req, res) => {
  try {
    const { language = 'python', source = '', stdin = '' } = req.body;

    if (!source) {
      return res.status(400).json({ error: 'Source code is required' });
    }

    console.log(`🚀 Running ${language} code with stdin: "${stdin}"`);
    
    // Use local execution instead of Judge0
    const result = await runCode(language, source, stdin);
    
    return res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode,
      time: 'Local execution',
      status: { description: result.exitCode === 0 ? 'Accepted' : 'Runtime Error' }
    });
  } catch (err) {
    console.error('💥 Code execution error:', err);
    return res.status(500).json({ 
      error: err.message, 
      stack: err.stack,
      stdout: '',
      stderr: err.message
    });
  }
});

// Interactive input endpoint
app.post('/api/input', async (req, res) => {
  try {
    const { executionId, input } = req.body;
    
    if (!executionId || !input) {
      return res.status(400).json({ error: 'Missing executionId or input' });
    }

    const execution = activeExecutions.get(executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    console.log(`📝 Sending input to execution ${executionId}:`, input);
    
    // Send input to the process
    execution.child.stdin.write(input);
    
    // Wait for response
    const result = await execution.promise;
    activeExecutions.delete(executionId);
    
    res.json(result);
  } catch (error) {
    console.error('💥 Error sending input:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
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
const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`🚀 My AI Buddy Backend running on http://localhost:${actualPort}`);
  console.log(`📡 Ready to communicate with Ollama at http://localhost:11434`);
  console.log(`💻 Legacy Code Editor API available at http://localhost:${actualPort}/api/run`);
  console.log(`⚡ Judge0 Proxy API available at http://localhost:${actualPort}/api/judge0/run`);
  console.log(`🌐 CORS enabled for any localhost port (dynamic port detection)`);
}); 