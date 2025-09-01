# SCORM Proxy Server Setup

This proxy server bypasses X-Frame-Options restrictions to display SCORM content directly within the KodeIt dashboard.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Proxy Server

**Windows:**
```bash
start-proxy.bat
```

**Unix/Mac:**
```bash
chmod +x start-proxy.sh
./start-proxy.sh
```

**Manual:**
```bash
cd backend
npm start
```

### 3. Verify Proxy Server
The proxy server will start on `http://localhost:5001`

Test endpoints:
- Health check: `http://localhost:5001/health`
- Test proxy: `http://localhost:5001/test-proxy`

## 🔧 Configuration

### Environment Variables
Update your `.env` file:

```env
# SCORM Proxy Server Configuration
VITE_SCORM_PROXY_URL=http://localhost:5001/kodeit-proxy
VITE_PROXY_SERVER_PORT=5001
```

### Proxy Server Features

- ✅ **X-Frame-Options Bypass**: Removes frame restrictions
- ✅ **URL Rewriting**: Fixes relative and absolute URLs
- ✅ **CORS Support**: Handles cross-origin requests
- ✅ **Error Handling**: Graceful fallbacks
- ✅ **Health Monitoring**: Built-in health checks

## 📋 How It Works

1. **Original Request**: `https://kodeit.legatoserver.com/scorm-package/`
2. **Proxy Request**: `http://localhost:5001/kodeit-proxy/scorm-package/`
3. **Content Processing**: Proxy fetches and modifies content
4. **Display**: Content appears in iframe without restrictions

## 🛠️ Troubleshooting

### Proxy Server Won't Start
```bash
# Check if port 5001 is available
netstat -an | grep 5001

# Kill process using port 5001 (if needed)
lsof -ti:5001 | xargs kill -9
```

### Content Not Loading
1. Check proxy server logs
2. Verify proxy server is running: `http://localhost:5001/health`
3. Test proxy connection: `http://localhost:5001/test-proxy`

### CORS Issues
Update CORS origins in `backend/proxy-server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  credentials: true
}));
```

## 🔒 Security Considerations

- **Same-Origin Policy**: Proxy maintains security while allowing iframe display
- **Content Modification**: URLs are rewritten to work through proxy
- **Authentication**: Proxy preserves original request headers
- **Caching**: Disabled to ensure fresh content

## 📝 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/kodeit-proxy/*` | Main proxy endpoint |
| `/health` | Health check |
| `/test-proxy` | Test proxy connectivity |

## 🎯 Benefits

- ✅ **Seamless Integration**: SCORM content appears within dashboard
- ✅ **No Popup Windows**: Content loads directly in iframe
- ✅ **Better UX**: Users stay within the application
- ✅ **Progress Tracking**: Maintains SCORM tracking functionality
- ✅ **Fallback Support**: Graceful degradation if proxy fails

## 🔄 Development

### Restart Proxy Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
cd backend
npm start
```

### View Logs
Proxy server provides detailed logging:
- Request URLs
- Response status
- Error messages
- Processing steps

### Customize Proxy
Edit `backend/proxy-server.js` to:
- Add authentication
- Modify content processing
- Change CORS settings
- Add rate limiting
