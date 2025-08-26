import express from 'express';
import axios from 'axios';

const router = express.Router();

// Language configuration for Piston API
const LANGUAGE_CONFIG = {
  python: {
    version: '3.10.0',
    extension: 'py'
  },
  javascript: {
    version: '18.15.0',
    extension: 'js'
  }
};

// POST /api/compiler/run
router.post('/run', async (req, res) => {
  try {
    const { language, version, code } = req.body;

    // Validate required fields
    if (!language || !code) {
      return res.status(400).json({
        error: 'Language and code are required'
      });
    }

    // Get language configuration
    const langConfig = LANGUAGE_CONFIG[language.toLowerCase()];
    if (!langConfig) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported languages: ${Object.keys(LANGUAGE_CONFIG).join(', ')}`
      });
    }

    // Use provided version or default
    const langVersion = version || langConfig.version;
    const fileName = `main.${langConfig.extension}`;

    console.log(`🚀 Compiling ${language} code with Piston API...`);
    console.log(`📝 Language: ${language}, Version: ${langVersion}`);
    console.log(`📄 File: ${fileName}`);

    // Prepare payload for Piston API
    const pistonPayload = {
      language: language.toLowerCase(),
      version: langVersion,
      files: [
        {
          name: fileName,
          content: code
        }
      ]
    };

    // Make request to Piston API
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', pistonPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Kodeit-Compiler/1.0'
      },
      timeout: 30000 // 30 second timeout
    });

    const result = response.data;

    // Handle Piston API response
    if (result.run) {
      const { stdout, stderr, code: exitCode, signal } = result.run;
      
      console.log(`✅ Code execution completed`);
      console.log(`📊 Exit code: ${exitCode}, Signal: ${signal || 'none'}`);
      console.log(`📤 Stdout length: ${stdout?.length || 0} chars`);
      console.log(`📥 Stderr length: ${stderr?.length || 0} chars`);

      return res.json({
        success: true,
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: exitCode || 0,
        signal: signal || null,
        executionTime: result.run.time || 0,
        memory: result.run.memory || 0
      });
    } else {
      console.error('❌ Piston API returned no run data');
      return res.status(500).json({
        error: 'No execution data received from Piston API',
        details: result
      });
    }

  } catch (error) {
    console.error('💥 Compiler error:', error);

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout - code execution took too long',
        details: 'The code execution exceeded the 30-second timeout limit'
      });
    }

    if (error.response) {
      // Piston API error response
      console.error('Piston API error:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Piston API error',
        details: error.response.data,
        status: error.response.status
      });
    }

    if (error.request) {
      // Network error
      return res.status(503).json({
        error: 'Network error - unable to reach Piston API',
        details: 'Please check your internet connection and try again'
      });
    }

    // Generic error
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/compiler/languages - Get supported languages
router.get('/languages', (req, res) => {
  const languages = Object.keys(LANGUAGE_CONFIG).map(lang => ({
    name: lang,
    version: LANGUAGE_CONFIG[lang].version,
    extension: LANGUAGE_CONFIG[lang].extension,
    label: lang.charAt(0).toUpperCase() + lang.slice(1)
  }));

  res.json({
    languages,
    count: languages.length
  });
});

export default router;
