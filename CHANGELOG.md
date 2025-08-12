# CHANGELOG - Judge0 CE Integration

## Overview
Integrated Judge0 CE as a secure backend for multi-language code execution, replacing the local system execution with containerized, secure execution.

## Files Added

### Infrastructure
- **`infra/judge0/docker-compose.yml`** - Judge0 CE Docker configuration
- **`infra/judge0/README.md`** - Judge0 setup instructions

### Frontend Services
- **`src/services/runClient.ts`** - TypeScript client for Judge0 proxy communication
- **`src/components/RunButton.tsx`** - Reusable run button component for Monaco editor
- **`src/constants/languages.ts`** - Language ID mapping constants

### Environment Configuration
- **`env.example`** - Frontend environment variables
- **`backend/env.example`** - Backend environment variables

## Files Modified

### Backend (`backend/`)
- **`package.json`** (lines 12-16): Added new dependencies
  - `dotenv`: "^16.4.5"
  - `express-rate-limit`: "^7.2.0" 
  - `helmet`: "^7.1.0"

- **`index.js`** (lines 1-50): Enhanced imports and configuration
  - Added helmet, rateLimit, dotenv imports
  - Added security middleware (helmet, rate limiting)
  - Added Judge0 configuration and language mappings
  - Updated CORS and request limits

- **`index.js`** (lines 450-480): Added Judge0 proxy endpoint
  - New `/api/judge0/run` endpoint for secure code execution
  - Maintains legacy `/api/run` endpoint for backward compatibility
  - Added proper error handling and timeout configuration

- **`index.js`** (lines 490-496): Updated server startup messages
  - Added Judge0 proxy API availability message

### Frontend (`src/features/codeEditor/`)
- **`CodeEditorPage.tsx`** (lines 150-180): Updated runCode function
  - Changed from local execution to Judge0 proxy
  - Updated endpoint from `/api/run` to `/api/judge0/run`
  - Updated request format to match Judge0 API
  - Enhanced error handling and output formatting

### Documentation
- **`README.md`** (lines 80-95): Updated setup instructions
  - Consolidated backend setup (removed separate server)
  - Updated port references from 8080 to 5000
  - Added sanity test code examples

## Files Removed
- **`server/`** - Entire directory removed (consolidated into backend)

## Commands to Start All Services

```bash
# 1. Start Judge0 CE (Docker)
cd infra/judge0
docker compose up -d

# 2. Start consolidated backend (includes Judge0 proxy)
cd ../../backend
cp env.example .env
npm install
npm start

# 3. Start frontend (in another terminal)
cd ..
npm run dev
```

## API Endpoints

### New Judge0 Proxy Endpoint
- **POST** `/api/judge0/run`
- **Body**: `{ language, source, stdin? }`
- **Response**: `{ status, stdout, stderr, compile_output, time, memory }`

### Legacy Endpoint (maintained for compatibility)
- **POST** `/api/run` - Local system execution

## Security Features Added
- Rate limiting (60 requests/minute)
- Helmet security headers
- CORS configuration
- Request size limits (200kb)
- Timeout protection (30 seconds)

## Supported Languages
- JavaScript (Node.js) - ID: 63
- Python 3.x - ID: 71  
- C (GCC) - ID: 50
- C++ (GCC) - ID: 54
- Java (OpenJDK) - ID: 62

## Environment Variables

### Frontend (`env.example`)
```
VITE_RUN_PROXY_URL=http://localhost:5000
```

### Backend (`backend/env.example`)
```
PORT=5000
JUDGE0_URL=http://localhost:2358
RATE_LIMIT_PER_MINUTE=60
ALLOWED_ORIGIN=http://localhost:8080
```
