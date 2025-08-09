const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuid } = require('uuid');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

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
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code, 'utf8');

    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { 
        cwd: tempDir,
        stdio: ['pipe', 'pipe', 'pipe']
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
        resolve({
          stdout: stdout,
          stderr: stderr,
          exitCode: code,
          diagnostics: []
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('Execution timeout'));
      }, 10000);
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

app.post('/api/run', async (req, res) => {
  try {
    const { language, code } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ error: 'Missing language or code' });
    }

    const result = await runCode(language, code);
    res.json(result);
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Test backend server listening on port ${PORT}`);
});
