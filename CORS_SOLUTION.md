# CORS Issue Solution for Moodle API Integration

## Problem Description

You encountered a CORS (Cross-Origin Resource Sharing) error when trying to access the Moodle API from your local development environment:

```
Access to XMLHttpRequest at 'https://kodeit.legatoserver.com/webservice/rest/server.php?wsfunction=core_enrol_get_users_courses&userid=28&wstoken=2eabaa23e0cf9a5442be25613c41abf5&moodlewsrestformat=json' from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

The error occurs because:
1. Your frontend runs on `http://localhost:8080`
2. Your Moodle API is on `https://kodeit.legatoserver.com`
3. The Moodle server doesn't have CORS headers configured to allow requests from localhost
4. Browsers block cross-origin requests by default for security reasons

## Solutions Implemented

### Solution 1: Backend Proxy (Recommended)

I've implemented a backend proxy route that forwards requests to the Moodle API. This is the most reliable solution for development.

#### Changes Made:

1. **Backend Proxy Route** (`backend/index.js`):
   - Added `/api/moodle` route that proxies requests to Moodle API
   - Handles authentication tokens automatically
   - Provides proper error handling

2. **Frontend Configuration** (`src/services/moodleApi.ts`):
   - Updated to use local backend proxy in development
   - Maintains direct API calls in production
   - Automatic environment detection

3. **Environment Variables** (`backend/env.example`):
   - Added `MOODLE_TOKEN` configuration

#### How It Works:

```
Frontend (localhost:8080) → Backend Proxy (localhost:5000) → Moodle API (kodeit.legatoserver.com)
```

### Solution 2: CORS Proxy (Alternative)

I've also prepared a CORS proxy solution as a fallback, but the backend proxy is preferred.

## Setup Instructions

### 1. Start Your Backend Server

```bash
cd backend
npm install
npm start
```

Your backend should be running on `http://localhost:5000`

### 2. Verify the Proxy Route

Test the proxy by visiting: `http://localhost:5000/api/moodle?wsfunction=core_webservice_get_site_info`

You should see a JSON response from the Moodle API.

### 3. Restart Your Frontend

```bash
npm run dev
```

Your frontend should now successfully fetch data from Moodle API through the proxy.

## Environment Variables

Make sure your backend has the following environment variables:

```env
PORT=5000
MOODLE_TOKEN=2eabaa23e0cf9a5442be25613c41abf5
```

## Production Deployment

For production deployment, you have several options:

### Option 1: Configure CORS on Moodle Server
Add the following headers to your Moodle server:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Option 2: Use the Backend Proxy in Production
Deploy your backend alongside your frontend and use the proxy approach.

### Option 3: Use a CDN/Proxy Service
Services like Cloudflare can handle CORS headers for you.

## Testing the Solution

1. **Check Backend Logs**: Look for "Moodle API Proxy" messages in your backend console
2. **Check Frontend Network Tab**: Requests should go to `localhost:5000/api/moodle`
3. **Verify Data Loading**: Your courses should load without CORS errors

## Troubleshooting

### If you still see CORS errors:
1. Ensure your backend is running on port 5000
2. Check that the proxy route is working: `http://localhost:5000/api/moodle?wsfunction=core_webservice_get_site_info`
3. Verify your frontend is using the development configuration

### If the proxy isn't working:
1. Check backend logs for errors
2. Verify the `MOODLE_TOKEN` environment variable is set
3. Test the Moodle API directly to ensure it's accessible

## Security Considerations

1. **Token Security**: Never expose your Moodle token in client-side code
2. **Rate Limiting**: The backend proxy includes rate limiting
3. **Error Handling**: Sensitive error details are not exposed to the client
4. **Environment Separation**: Development and production configurations are properly separated

## Next Steps

1. Test the solution with your existing code
2. Monitor backend logs for any issues
3. Consider implementing caching for better performance
4. Set up proper error monitoring for production deployment
