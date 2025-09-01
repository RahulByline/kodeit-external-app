const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:3000'],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Proxy endpoint for KodeIt content
app.get('/kodeit-proxy/*', async (req, res) => {
  try {
    // Extract the path after /kodeit-proxy/
    const targetPath = req.params[0] || '';
    const targetUrl = `https://kodeit.legatoserver.com/${targetPath}`;
    
    console.log(`🔄 Proxying request to: ${targetUrl}`);
    
    // Create custom HTTPS agent to handle SSL issues
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Allow self-signed certificates
      secureProtocol: 'TLSv1_2_method', // Use TLS 1.2
      ciphers: 'ALL', // Allow all ciphers
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3'
    });
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow',
      agent: httpsAgent,
      timeout: 30000
    });

    if (!response.ok) {
      console.error(`❌ Proxy error: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(`Proxy error: ${response.statusText}`);
    }

    let body = await response.text();
    const contentType = response.headers.get('content-type');

    // Fix relative URLs to point through our proxy
    if (contentType && contentType.includes('text/html')) {
      body = body.replace(/(src|href)="\/([^"]+)"/g, '$1="/kodeit-proxy/$2"');
      body = body.replace(/(src|href)="\.\/([^"]+)"/g, '$1="/kodeit-proxy/$2"');
      body = body.replace(/(src|href)="\.\.\/([^"]+)"/g, '$1="/kodeit-proxy/$2"');
      
      // Fix absolute URLs that point to the same domain
      body = body.replace(/https:\/\/kodeit\.legatoserver\.com\//g, '/kodeit-proxy/');
      
      // Add base tag to ensure relative URLs work correctly
      if (!body.includes('<base')) {
        body = body.replace('<head>', '<head><base href="/kodeit-proxy/">');
      }
    }

    // Set appropriate headers
    res.set({
      'Content-Type': contentType || 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff'
    });

    console.log(`✅ Successfully proxied content from: ${targetUrl}`);
    res.send(body);

  } catch (error) {
    console.error('❌ Proxy server error:', error);
    res.status(500).json({
      error: 'Failed to fetch content from KodeIt server',
      message: error.message,
      url: req.url
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'KodeIt Proxy Server'
  });
});

// Test endpoint to verify proxy is working
app.get('/test-proxy', async (req, res) => {
  try {
    // Create custom HTTPS agent to handle SSL issues
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
      ciphers: 'ALL',
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3'
    });
    
    const response = await fetch('https://kodeit.legatoserver.com/', {
      agent: httpsAgent,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const status = response.status;
    const ok = response.ok;
    
    res.json({
      status: 'Proxy test completed',
      targetUrl: 'https://kodeit.legatoserver.com/',
      responseStatus: status,
      isOk: ok,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Proxy test failed',
      message: error.message,
      details: error.stack
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 KodeIt Proxy Server running at http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/kodeit-proxy/`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-proxy`);
});
