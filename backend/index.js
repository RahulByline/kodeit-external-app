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
import compilerRoutes from './routes/compiler.js';
import cohortSettingsRoutes from './routes/cohortSettings.js';
import blocklyRoutes from './routes/blockly.routes.js';
// Note: Using native fetch (available in Node.js 18+)
 
const app = express();
app.use(express.json({ limit: '1mb' }));
const PORT = process.env.PORT || 5000;
const JUDGE0_URL = process.env.JUDGE0_URL?.replace(/\/+$/, '') || 'https://judge0-ce.p.rapidapi.com';

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'} - User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'No user-agent'}`);
  next();
});

// CORS middleware - Allow specific localhost ports (must come before helmet)
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow specific localhost ports
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control']
}));

// Fallback CORS middleware for development - more permissive
app.use((req, res, next) => {
  // Only apply fallback CORS if the main CORS middleware didn't set headers
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Security middleware with CORS-friendly settings
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: "200kb" }));
// Rate limiting
const limiter = rateLimit({
  windowMs: 60_000,
  limit: Number(process.env.RATE_LIMIT_PER_MINUTE || 60)
});
app.use(limiter);

// Test endpoint to verify CORS is working
app.get('/api/test-cors', (req, res) => {
  console.log('🧪 Test CORS endpoint hit - Origin:', req.headers.origin);
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

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
// async function runCodeInteractive(language, code, executionId) {
//   // Use platform-specific temp directory
//   const tempDir = process.platform === 'win32' 
//     ? path.join(process.cwd(), `code-${executionId}`)
//     : path.join('/home/bylinelm/kodeit-lms-backend.bylinelms.com', `code-${executionId}`);
  
//   try {
//     await fs.mkdir(tempDir, { recursive: true });
//     console.log(`📁 Created temp directory: ${tempDir}`);
//   } catch (error) {
//     console.error(`❌ Failed to create temp directory: ${error.message}`);
//     throw new Error(`Failed to create temporary directory: ${error.message}`);
//   }
 
//   try {
//     let fileName, command, args;
   
//     switch (language) {
//       case 'python':
//         fileName = 'main.py';
//         // Use platform-specific Python command
//         if (process.platform === 'win32') {
//           command = 'py'; // Windows Python
//         } else {
//           command = '/usr/bin/python3'; // Linux Python
//         }
//         args = ['main.py'];
//         break;
//       case 'javascript':
//         // JavaScript uses vm module, no file creation needed
//         fileName = 'main.js';
//         command = null; // Not used for JavaScript
//         args = null; // Not used for JavaScript
//         break;
//       default:
//         throw new Error(`Interactive execution not supported for ${language}`);
//     }
 
//     // Preprocess code to fix indentation issues
//     let processedCode = code;
//     if (language === 'python') {
//       processedCode = code.trim();
//       console.log('🔧 Python code preprocessed for interactive execution - removed extra whitespace');
//     }
    
//     // Handle JavaScript execution differently (no file creation needed)
//     if (language === 'javascript') {
//       console.log('🔧 JavaScript execution - using vm module');
      
//       try {
//         const vm = await import('vm');
//         let stdout = '';
//         let stderr = '';
        
//         // Create a safe context with console.log captured
//         const context = {
//           console: {
//             log: (...args) => {
//               stdout += args.join(' ') + '\n';
//             },
//             error: (...args) => {
//               stderr += args.join(' ') + '\n';
//             },
//             warn: (...args) => {
//               stderr += args.join(' ') + '\n';
//             }
//           },
//           setTimeout,
//           setInterval,
//           clearTimeout,
//           clearInterval,
//           Buffer,
//           process: {
//             env: process.env,
//             version: process.version,
//             platform: process.platform
//           }
//         };
        
//         // Create sandboxed context
//         const sandbox = vm.createContext(context);
        
//         // Execute the code with timeout
//         const script = new vm.Script(processedCode);
//         script.runInContext(sandbox, { timeout: 5000 });
        
//         console.log(`JavaScript execution completed successfully`);
//         console.log(`JavaScript stdout:`, stdout);
//         console.log(`JavaScript stderr:`, stderr);
        
//         return {
//           stdout: stdout,
//           stderr: stderr,
//           exitCode: 0,
//           diagnostics: []
//         };
        
//       } catch (error) {
//         console.error(`JavaScript execution error:`, error);
//         return {
//           stdout: '',
//           stderr: `Execution error: ${error.message}`,
//           exitCode: -1,
//           diagnostics: []
//         };
//       }
//     }
    
//     const filePath = path.join(tempDir, fileName);
//     await fs.writeFile(filePath, processedCode, { encoding: 'utf8', flag: 'w' });
   
//     console.log(`Created file: ${filePath}`);
//     console.log(`Working directory: ${tempDir}`);
 
//     return new Promise((resolve, reject) => {
//       const child = spawn(command, args, {
//         cwd: tempDir,
//         stdio: ['pipe', 'pipe', 'pipe'],
//         shell: false
//       });
 
//       let stdout = '';
//       let stderr = '';
//       let isWaitingForInput = false;
 
//       // Set up timeout
//       const timeout = 30000; // 30 seconds for interactive execution
//       const timeoutId = setTimeout(() => {
//         child.kill('SIGTERM');
//         setTimeout(() => child.kill('SIGKILL'), 1000);
//         reject(new Error(`Execution timed out after ${timeout}ms`));
//       }, timeout);
 
//       child.stdout.on('data', (data) => {
//         const output = data.toString();
//         stdout += output;
//         console.log(`📤 stdout: ${output}`);
       
//         // Check if the process is waiting for input
//         if (output.includes('Enter') || output.includes('input') || output.includes(':')) {
//           isWaitingForInput = true;
//           console.log('🔄 Detected input() call - waiting for user input');
          
//           // Store execution for later input and return immediately
//           activeExecutions.set(executionId, {
//             child,
//             promise: new Promise((res, rej) => {
//               let finalStdout = stdout;
//               let finalStderr = stderr;
              
//               child.stdout.on('data', (data) => {
//                 finalStdout += data.toString();
//               });
              
//               child.stderr.on('data', (data) => {
//                 finalStderr += data.toString();
//               });
              
//               child.on('close', (finalCode) => {
//                 res({
//                   stdout: finalStdout,
//                   stderr: finalStderr,
//                   exitCode: finalCode,
//                   diagnostics: []
//                 });
//               });
//               child.on('error', rej);
//             })
//           });
          
//           // Clear timeout and resolve immediately
//           clearTimeout(timeoutId);
//           resolve({
//             waitingForInput: true,
//             executionId: executionId,
//             stdout: stdout,
//             stderr: stderr
//           });
//         }
//       });
 
//       child.stderr.on('data', (data) => {
//         const error = data.toString();
//         stderr += error;
//         console.log(`📤 stderr: ${error}`);
//       });
 
//       child.on('close', (code) => {
//         clearTimeout(timeoutId);
//         console.log(`✅ Interactive execution completed with exit code: ${code}`);
       
//         // Clean up temp directory
//         fs.rm(tempDir, { recursive: true, force: true }).catch(err =>
//           console.warn('Failed to clean up temp directory:', err)
//         );
 
//         // Only resolve if we haven't already resolved due to input waiting
//         if (!isWaitingForInput) {
//           resolve({
//             stdout: stdout,
//             stderr: stderr,
//             exitCode: code,
//             diagnostics: []
//           });
//         }
//       });
 
//       child.on('error', (error) => {
//         clearTimeout(timeoutId);
//         console.error(`💥 Interactive execution error:`, error);
//         reject(error);
//       });
//     });
//   } catch (error) {
//     // Clean up temp directory
//     try {
//       await fs.rm(tempDir, { recursive: true, force: true });
//     } catch (err) {
//       console.warn('Failed to clean up temp directory:', err);
//     }
//     throw error;
//   }
// }
 
// Code Execution Function
// async function runCode(language, code, stdin = '') {
//   const tempDir = path.join(os.tmpdir(), `code-${uuid()}`);
//   await fs.mkdir(tempDir, { recursive: true });
 
//   try {
//     let fileName, command, args;
   
//     switch (language) {
//       case 'javascript':
//         fileName = 'main.js';
//         command = 'node';
//         args = ['main.js'];
//         break;
//       case 'python':
//         fileName = 'main.py';
//         command = 'py'; // Use 'py' for Windows Python
//         args = ['main.py'];
//         break;
//       case 'java':
//         fileName = 'Main.java';
//         command = 'javac';
//         args = ['Main.java'];
//         break;
//       case 'c':
//         fileName = 'main.c';
//         command = 'gcc';
//         args = ['main.c', '-o', 'main.exe'];
//         break;
//       case 'cpp':
//         fileName = 'main.cpp';
//         command = 'g++';
//         args = ['main.cpp', '-o', 'main.exe'];
//         break;
//       default:
//         throw new Error(`Unsupported language: ${language}`);
//     }
 
//     // Java-specific paths
//     const javaPaths = {
//       javac: 'C:\\Program Files\\Microsoft\\jdk-17.0.16.8-hotspot\\bin\\javac.exe',
//       java: 'C:\\Program Files\\Microsoft\\jdk-17.0.16.8-hotspot\\bin\\java.exe'
//     };
 
//     // Check if command is available (skip for Python and JavaScript - we'll handle them directly)
//     let commandPath = command;
//     if (language === 'java') {
//       commandPath = javaPaths.javac;
//       // Check if Java is available
//       try {
//         await fs.access(javaPaths.javac);
//         await fs.access(javaPaths.java);
//         console.log('✅ Java JDK found at:', javaPaths.javac);
//       } catch (error) {
//         console.log('❌ Java JDK not found at expected path:', javaPaths.javac);
//         // Try to find Java in PATH as fallback
//         try {
//           const { execSync } = await import('child_process');
//           execSync(`where javac`, { stdio: 'ignore' });
//           console.log('✅ Java found in PATH');
//           commandPath = 'javac';
//         } catch (pathError) {
//           throw new Error(`Java JDK is not installed or not found. Please install Java JDK to run Java code.`);
//         }
//       }
//     } else if (language === 'javascript') {
//       // Use absolute path for Node.js on server
//       commandPath = '/home/bylinelm/.nvm/versions/node/v22.13.0/bin/node';
//       console.log('✅ Using Node.js at:', commandPath);
//     } else if (language !== 'python') {
//       // Only check PATH for other languages
//       try {
//         const { execSync } = await import('child_process');
//         execSync(`where ${command}`, { stdio: 'ignore' });
//         console.log(`✅ ${command} found in PATH`);
//       } catch (error) {
//         throw new Error(`${getLanguageLabel(language)} is not installed or not in PATH. Please install ${getLanguageLabel(language)} to run ${language} code.`);
//       }
//     }
 
//          // Preprocess Python code to handle input() calls better and fix indentation
//      let processedCode = code;
//      if (language === 'python') {
//        // Remove leading/trailing whitespace and normalize indentation
//        processedCode = code.trim();
       
//        // If the code has input() calls, add a comment
//        if (code.includes('input(')) {
//          processedCode = `# Note: This code uses input() - interactive input will be handled\n${processedCode}`;
//          console.log('🔧 Python code preprocessed for input() handling');
//        }
       
//        console.log('🔧 Python code preprocessed - removed extra whitespace');
//      }
     
//      // Skip file creation for Python and JavaScript since we're using inline execution
//      if (language !== 'python' && language !== 'javascript') {
//        const filePath = path.join(tempDir, fileName);
//        await fs.writeFile(filePath, processedCode, { encoding: 'utf8', flag: 'w' });
     
//       // Verify file was created and has content
//       const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
//       if (!fileExists) {
//         throw new Error(`Failed to create file: ${filePath}`);
//       }
     
//       // Read back the file to verify content
//       const fileContent = await fs.readFile(filePath, 'utf8');
//       if (!fileContent.trim()) {
//         throw new Error(`File was created but is empty: ${filePath}`);
//       }
     
//       console.log(`Created file: ${filePath}`);
//       console.log(`File content length: ${fileContent.length} characters`);
//       console.log(`Working directory: ${tempDir}`);
     
//       // Give file system time to sync
//       await new Promise(resolve => setTimeout(resolve, 200));
//      } else {
//        console.log(`🐍 Skipping file creation for ${language} (using inline execution)`);
//      }
 
//     return new Promise(async (resolve, reject) => {
//       try {
//         if (language === 'java') {
//           // Compile Java
//           console.log('Starting Java compilation...');
//           const compileResult = await new Promise((compileResolve, compileReject) => {
//             const compileChild = spawn(commandPath, ['Main.java'], {
//               cwd: tempDir,
//               stdio: ['pipe', 'pipe', 'pipe']
//             });
 
//             let compileStdout = '';
//             let compileStderr = '';
 
//             compileChild.stdout.on('data', (data) => {
//               compileStdout += data.toString();
//             });
 
//             compileChild.stderr.on('data', (data) => {
//               compileStderr += data.toString();
//             });
 
//             compileChild.on('close', (code) => {
//               console.log('Java compilation completed with code:', code);
//               console.log('Java compilation stderr:', compileStderr);
//               console.log('Java compilation stdout:', compileStdout);
//               compileResolve({
//                 stdout: compileStdout,
//                 stderr: compileStderr,
//                 exitCode: code
//               });
//             });
 
//             compileChild.on('error', (error) => {
//               console.log('Java compilation error:', error);
//               compileReject(error);
//             });
//           });
 
//           if (compileResult.exitCode !== 0) {
//             console.log('Java compilation failed with exit code:', compileResult.exitCode);
//             console.log('Java compilation stderr:', compileResult.stderr);
//             console.log('Java compilation stdout:', compileResult.stdout);
//             resolve({
//               stdout: compileResult.stdout,
//               stderr: compileResult.stderr,
//               exitCode: compileResult.exitCode,
//               diagnostics: []
//             });
//             return;
//           }
 
//           // Run compiled Java
//           console.log('Starting Java execution...');
//           const runChild = spawn('java', ['Main'], {
//             cwd: tempDir,
//             stdio: ['pipe', 'pipe', 'pipe']
//           });
 
//           let stdout = '';
//           let stderr = '';
 
//           runChild.stdout.on('data', (data) => {
//             stdout += data.toString();
//           });
 
//           runChild.stderr.on('data', (data) => {
//             stderr += data.toString();
//           });
 
//           runChild.on('close', (code) => {
//             console.log('Java execution completed with code:', code);
//             console.log('Java stdout:', stdout);
//             console.log('Java stderr:', stderr);
//             resolve({
//               stdout: stdout,
//               stderr: stderr,
//               exitCode: code,
//               diagnostics: []
//             });
//           });
 
//           runChild.on('error', (error) => {
//             console.log('Java execution error:', error);
//             reject(error);
//           });
 
//           // Ensure process cleanup
//           runChild.on('exit', (code) => {
//             console.log('Java process exited with code:', code);
//           });
 
//         } else if (language === 'c' || language === 'cpp') {
//           // Compile C/C++
//           console.log(`Starting ${language.toUpperCase()} compilation...`);
//           const compileResult = await new Promise((compileResolve, compileReject) => {
//             const compileChild = spawn(command, args, {
//               cwd: tempDir,
//               stdio: ['pipe', 'pipe', 'pipe']
//             });
 
//             let compileStdout = '';
//             let compileStderr = '';
 
//             compileChild.stdout.on('data', (data) => {
//               compileStdout += data.toString();
//             });
 
//             compileChild.stderr.on('data', (data) => {
//               compileStderr += data.toString();
//             });
 
//             compileChild.on('close', (code) => {
//               console.log(`${language.toUpperCase()} compilation completed with code:`, code);
//               compileResolve({
//                 stdout: compileStdout,
//                 stderr: compileStderr,
//                 exitCode: code
//               });
//             });
 
//             compileChild.on('error', (error) => {
//               console.log(`${language.toUpperCase()} compilation error:`, error);
//               compileReject(error);
//             });
//           });
 
//           if (compileResult.exitCode !== 0) {
//             console.log(`${language.toUpperCase()} compilation failed with exit code:`, compileResult.exitCode);
//             console.log(`${language.toUpperCase()} compilation stderr:`, compileResult.stderr);
//             resolve({
//               stdout: compileResult.stdout,
//               stderr: compileResult.stderr,
//               exitCode: compileResult.exitCode,
//               diagnostics: []
//             });
//             return;
//           }
 
//           // Run compiled executable
//           console.log(`Starting ${language.toUpperCase()} execution...`);
//           const runChild = spawn('./main.exe', [], {
//             cwd: tempDir,
//             stdio: ['pipe', 'pipe', 'pipe']
//           });
 
//           let stdout = '';
//           let stderr = '';
 
//           runChild.stdout.on('data', (data) => {
//             stdout += data.toString();
//           });
 
//           runChild.stderr.on('data', (data) => {
//             stderr += data.toString();
//           });
 
//           runChild.on('close', (code) => {
//             console.log(`${language.toUpperCase()} execution completed with code:`, code);
//             console.log(`${language.toUpperCase()} stdout:`, stdout);
//             console.log(`${language.toUpperCase()} stderr:`, stderr);
//             resolve({
//               stdout: stdout,
//               stderr: stderr,
//               exitCode: code,
//               diagnostics: []
//             });
//           });
 
//           runChild.on('error', (error) => {
//             console.log(`${language.toUpperCase()} execution error:`, error);
//             reject(error);
//           });
 
//           // Ensure process cleanup
//           runChild.on('exit', (code) => {
//             console.log(`${language.toUpperCase()} process exited with code:`, code);
//           });
 
//                                   } else if (language === 'python') {
//            // Simple Python execution without file creation (from test-simple.js)
//            console.log(`Starting Python execution with inline method`);
           
//            // Use platform-specific Python command
//            const pythonCommand = process.platform === 'win32' ? 'py' : '/usr/bin/python3';
           
//            const child = spawn(pythonCommand, ['-c', processedCode], {
//              stdio: ['pipe', 'pipe', 'pipe'],
//              shell: false  // Don't use shell to avoid escaping issues
//            });

//            let stdout = '';
//            let stderr = '';
//            let isResolved = false;

//            // Send stdin if provided
//            if (stdin) {
//              console.log('📝 Sending stdin:', JSON.stringify(stdin));
//              child.stdin.write(stdin + '\n');
//              child.stdin.end();
//            }

//            child.stdout.on('data', (data) => {
//              stdout += data.toString();
//            });

//            child.stderr.on('data', (data) => {
//              stderr += data.toString();
//            });

//            child.on('close', (code) => {
//              if (!isResolved) {
//                isResolved = true;
//                console.log(`Python execution completed with exit code:`, code);
//                console.log(`Python stdout:`, stdout);
//                console.log(`Python stderr:`, stderr);
               
//                resolve({
//                  stdout: stdout,
//                  stderr: stderr,
//                  exitCode: code,
//                  diagnostics: []
//                });
//              }
//            });

//            child.on('error', (error) => {
//              if (!isResolved) {
//                isResolved = true;
//                console.error(`Python execution error:`, error);
//                resolve({
//                  stdout: '',
//                  stderr: `Execution error: ${error.message}`,
//                  exitCode: -1,
//                  diagnostics: []
//                });
//              }
//            });

//            // Add timeout
//            setTimeout(() => {
//              if (!isResolved) {
//                child.kill('SIGTERM');
//                console.log(`⏰ Python execution timed out`);
//                isResolved = true;
//                resolve({
//                  stdout: stdout,
//                  stderr: stderr + '\n[Execution timed out after 5 seconds]',
//                  exitCode: -1,
//                  diagnostics: []
//                });
//              }
//            }, 5000);
//          } else if (language === 'javascript') {
//            // Simple JavaScript execution using vm module (no spawning needed)
//            console.log(`Starting JavaScript execution with vm module`);
           
//            try {
//              const vm = await import('vm');
//              let stdout = '';
//              let stderr = '';
             
//              // Create a safe context with console.log captured
//              const context = {
//                console: {
//                  log: (...args) => {
//                    stdout += args.join(' ') + '\n';
//                  },
//                  error: (...args) => {
//                    stderr += args.join(' ') + '\n';
//                  },
//                  warn: (...args) => {
//                    stderr += args.join(' ') + '\n';
//                  }
//                },
//                setTimeout,
//                setInterval,
//                clearTimeout,
//                clearInterval,
//                Buffer,
//                process: {
//                  env: process.env,
//                  version: process.version,
//                  platform: process.platform
//                }
//              };
             
//              // Create sandboxed context
//              const sandbox = vm.createContext(context);
             
//              // Execute the code with timeout
//              const script = new vm.Script(processedCode);
//              script.runInContext(sandbox, { timeout: 5000 });
             
//              console.log(`JavaScript execution completed successfully`);
//              console.log(`JavaScript stdout:`, stdout);
//              console.log(`JavaScript stderr:`, stderr);
             
//              resolve({
//                stdout: stdout,
//                stderr: stderr,
//                exitCode: 0,
//                diagnostics: []
//              });
             
//            } catch (error) {
//              console.error(`JavaScript execution error:`, error);
//              resolve({
//                stdout: '',
//                stderr: `Execution error: ${error.message}`,
//                exitCode: -1,
//                diagnostics: []
//              });
//            }
//          } else {
//            // For other interpreted languages
//            console.log(`Starting ${language} execution with command: ${commandPath} ${args.join(' ')}`);
           
//            // Add timeout for execution to prevent infinite loops
//            const timeout = 5000; // 5 seconds for others
           
//            // Use provided stdin
//            let finalStdin = stdin;
//            if (stdin) {
//              // Ensure stdin ends with newline
//              finalStdin = stdin.endsWith('\n') ? stdin : (stdin + '\n');
//              console.log('📝 Using provided stdin:', JSON.stringify(stdin));
//            }
           
//            const child = spawn(commandPath, args, {
//              cwd: tempDir,
//              stdio: ['pipe', 'pipe', 'pipe'],
//              shell: true // Use shell for better path resolution
//            });

//            let stdout = '';
//            let stderr = '';
//            let isResolved = false;

//            // Set up timeout
//            const timeoutId = setTimeout(() => {
//              if (!isResolved) {
//                console.log(`${language} execution timed out after ${timeout}ms`);
//                child.kill('SIGTERM'); // Try graceful termination first
               
//                setTimeout(() => {
//                  if (!isResolved) {
//                    child.kill('SIGKILL'); // Force kill if still running
//                  }
//                }, 1000);
               
//                isResolved = true;
//                resolve({
//                  stdout: stdout,
//                  stderr: stderr + `\n[Execution timed out after ${timeout}ms]`,
//                  exitCode: -1,
//                  diagnostics: []
//                });
//              }
//            }, timeout);

//            // Send stdin if provided
//            if (finalStdin) {
//              child.stdin.write(finalStdin);
//              child.stdin.end();
//            }

//            child.stdout.on('data', (data) => {
//              stdout += data.toString();
//            });

//            child.stderr.on('data', (data) => {
//              stderr += data.toString();
//            });

//            child.on('close', (code) => {
//              if (!isResolved) {
//                clearTimeout(timeoutId);
//                isResolved = true;
//                console.log(`${language} execution completed with exit code:`, code);
//                console.log(`${language} stdout:`, stdout);
//                console.log(`${language} stderr:`, stderr);
//                resolve({
//                  stdout: stdout,
//                  stderr: stderr,
//                  exitCode: code,
//                  diagnostics: []
//                });
//              }
//            });

//            child.on('error', (error) => {
//              if (!isResolved) {
//                clearTimeout(timeoutId);
//                isResolved = true;
//                console.error(`${language} execution error:`, error);
//                reject(error);
//              }
//            });

//            // Ensure process cleanup
//            child.on('exit', (code) => {
//              console.log(`${language} process exited with code:`, code);
//            });
//          }
 
//         // Removed timeout to prevent execution failures
//         // Code execution will complete naturally without artificial time limits
 
//       } catch (error) {
//         reject(error);
//       }
//     });
//   } finally {
//     // Clean up
//     try {
//       await fs.rm(tempDir, { recursive: true, force: true });
//     } catch (err) {
//       console.warn('Failed to clean up temp directory:', err);
//     }
//   }
// }
 
 
 
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
      let inputCount = 0;
      let lastOutputTime = Date.now();

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
            lastOutputTime = Date.now();
            
            // Check if the process is waiting for input
            // Look for common input prompts
            if (output.includes('Enter') || 
                output.includes('input') || 
                output.includes(':') ||
                output.includes('?') ||
                output.trim().endsWith(':') ||
                output.includes('What') ||
                output.includes('Please') ||
                output.includes('Type') ||
                output.includes('name') ||
                output.includes('age') ||
                output.includes('surname')) {
              isWaitingForInput = true;
              inputCount++;
              console.log(`📤 Process is waiting for input (input #${inputCount})`);
            }
          });

      // Also monitor stderr for input prompts
      child.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        console.log(`📤 stderr: ${error}`);
        
        // Sometimes input prompts appear in stderr
        if (error.includes('Enter') || 
            error.includes('input') || 
            error.includes(':') ||
            error.includes('?') ||
            error.trim().endsWith(':') ||
            error.includes('What') ||
            error.includes('Please') ||
            error.includes('Type') ||
            error.includes('name') ||
            error.includes('age') ||
            error.includes('surname')) {
          isWaitingForInput = true;
          inputCount++;
          console.log(`📤 Process is waiting for input (from stderr, input #${inputCount})`);
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
              let finalStdout = stdout;
              let finalStderr = stderr;
              
              // Continue monitoring output after storing the execution
              child.stdout.on('data', (data) => {
                const output = data.toString();
                finalStdout += output;
                console.log(`📤 Continued stdout: ${output}`);
              });
              
              child.stderr.on('data', (data) => {
                const error = data.toString();
                finalStderr += error;
                console.log(`📤 Continued stderr: ${error}`);
              });
              
              child.on('close', (finalCode) => {
                res({
                  stdout: finalStdout,
                  stderr: finalStderr,
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
            stderr: stderr,
            inputCount: inputCount
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

// Interactive code execution endpoint
app.post('/api/run-interactive', async (req, res) => {
  try {
    const { language = 'python', source = '', stdin = '' } = req.body;
 
    if (!source) {
      return res.status(400).json({ error: 'Source code is required' });
    }
 
    console.log(`🚀 Running ${language} code interactively`);
   
    // Use interactive execution
    const result = await runCodeInteractive(language, source, uuid());
   
    return res.json(result);
  } catch (err) {
    console.error('💥 Interactive code execution error:', err);
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
    const { executionId, input, isLastInput = false } = req.body;
    
    if (!executionId || input === undefined) {
      return res.status(400).json({ error: 'Missing executionId or input' });
    }

    const execution = activeExecutions.get(executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
 
    console.log(`📝 Sending input to execution ${executionId}:`, input);
    console.log(`📝 Is last input:`, isLastInput);
   
    // Send input to the process with newline
    execution.child.stdin.write(input + '\n');
    
    // Only end stdin if this is the last input
    if (isLastInput) {
      execution.child.stdin.end();
      console.log(`📝 Closing stdin for execution ${executionId}`);
    }
   
    // For non-last inputs, we need to check if the process is still waiting for input
    if (!isLastInput) {
      // Wait a bit for the process to process the input
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if the process has completed
      if (execution.child.exitCode !== null) {
        // Process has completed, get the final result
        const result = await execution.promise;
        activeExecutions.delete(executionId);
        return res.json(result);
      } else {
        // Process is still running, assume it's waiting for more input
        return res.json({
          waitingForInput: true,
          executionId: executionId,
          message: 'Input sent, waiting for more input...'
        });
      }
    }
   
    // Wait for final response with timeout
    const timeout = 10000; // 10 seconds timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Input response timed out')), timeout);
    });
    
    const result = await Promise.race([execution.promise, timeoutPromise]);
    
    // Only delete execution if this was the last input
    if (isLastInput) {
      activeExecutions.delete(executionId);
      console.log(`📝 Removed execution ${executionId} from active executions`);
    }
   
    res.json(result);
  } catch (error) {
    console.error('💥 Error sending input:', error);
    res.status(500).json({
      error: error.message,
      details: error.stack
    });
  }
});

// Multiple inputs endpoint for handling multiple input fields
app.post('/api/input-multiple', async (req, res) => {
  try {
    const { executionId, inputs } = req.body;
    
    if (!executionId || !Array.isArray(inputs)) {
      return res.status(400).json({ error: 'Missing executionId or inputs array' });
    }

    const execution = activeExecutions.get(executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
 
    console.log(`📝 Sending ${inputs.length} inputs to execution ${executionId}:`, inputs);
   
    // Send all inputs to the process with proper delays
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const isLast = i === inputs.length - 1;
      
      console.log(`📝 Sending input ${i + 1}/${inputs.length}:`, input);
      execution.child.stdin.write(input + '\n');
      
      // Add a longer delay between inputs to ensure proper processing
      if (!isLast) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Only end stdin after the last input
      if (isLast) {
        execution.child.stdin.end();
        console.log(`📝 Closing stdin for execution ${executionId}`);
      }
    }
   
    // Wait for response with timeout
    const timeout = 15000; // 15 seconds timeout for multiple inputs
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Input response timed out')), timeout);
    });
    
    const result = await Promise.race([execution.promise, timeoutPromise]);
    activeExecutions.delete(executionId);
    console.log(`📝 Removed execution ${executionId} from active executions`);
   
    res.json(result);
  } catch (error) {
    console.error('💥 Error sending multiple inputs:', error);
    res.status(500).json({
      error: error.message,
      details: error.stack
    });
  }
});

// --- Compiler API routes
app.use('/api/compiler', compilerRoutes);

// --- Cohort Settings API routes
app.use('/api/cohort-settings', cohortSettingsRoutes);

// --- Moodle API Proxy Route
app.use('/api/moodle', async (req, res) => {
  try {
    const MOODLE_BASE_URL = 'https://kodeit.legatoserver.com/webservice/rest/server.php';
    const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '2eabaa23e0cf9a5442be25613c41abf5';
    
    // Forward the request to Moodle API
    const response = await axios({
      method: req.method,
      url: MOODLE_BASE_URL,
      params: {
        ...req.query,
        wstoken: MOODLE_TOKEN,
        moodlewsrestformat: 'json'
      },
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Moodle API Proxy Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to proxy request to Moodle API',
      details: error.message 
    });
  }
});

// --- Static files: serves /editor/* and other public assets
app.use(express.static(path.join(process.cwd(), '..', 'public')));

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
  console.log(`⚡ Judge0 Proxy API available at http://localhost:${actualPort}/api/run`);
  console.log(`🌐 CORS enabled for localhost ports: 3000, 8080, 5173, 4173`);
}); 
