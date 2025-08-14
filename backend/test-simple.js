import express from 'express';
import { spawn } from 'child_process';

const app = express();
app.use(express.json());

// Simple logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
}

app.post('/api/run', async (req, res) => {
  try {
    const { language = 'python', source = '', stdin = '' } = req.body;
    
    if (!source) {
      return res.status(400).json({ error: 'Source code is required' });
    }

    log(`🚀 Running ${language} code: ${source.substring(0, 50)}...`);
    
    if (language === 'python') {
             // Simple Python execution without file creation
       const child = spawn('/usr/bin/python3', ['-c', source], {
         stdio: ['pipe', 'pipe', 'pipe'],
         shell: false  // Don't use shell to avoid escaping issues
       });

             let stdout = '';
       let stderr = '';

       // Send stdin if provided
       if (stdin) {
         log(`📝 Sending stdin: "${stdin}"`);
         child.stdin.write(stdin + '\n');
         child.stdin.end();
       }

       child.stdout.on('data', (data) => {
         stdout += data.toString();
       });

       child.stderr.on('data', (data) => {
         stderr += data.toString();
       });

      child.on('close', (code) => {
        log(`✅ Python execution completed with code: ${code}`);
        log(`📤 stdout: ${stdout}`);
        log(`📤 stderr: ${stderr}`);
        
        res.json({
          stdout: stdout,
          stderr: stderr,
          exitCode: code,
          status: { description: code === 0 ? 'Accepted' : 'Runtime Error' }
        });
      });

      child.on('error', (error) => {
        log(`❌ Python execution error: ${error.message}`);
        res.status(500).json({
          error: error.message,
          stdout: '',
          stderr: error.message
        });
      });

      // Add timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        log(`⏰ Python execution timed out`);
        res.status(500).json({
          error: 'Execution timed out',
          stdout: '',
          stderr: 'Execution timed out after 5 seconds'
        });
      }, 5000);

    } else {
      res.status(400).json({ error: 'Only Python is supported in test mode' });
    }

  } catch (error) {
    log(`💥 Error: ${error.message}`);
    res.status(500).json({
      error: error.message,
      stdout: '',
      stderr: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});
