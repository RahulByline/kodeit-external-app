# cPanel Deployment Guide for Code Editor Backend

## Step 1: Prepare Your Files

1. **Create a zip file** of your backend folder:
   - Select all files in the `backend/` folder
   - Create a zip file named `backend.zip`

## Step 2: Upload to cPanel

1. **Login to cPanel**
2. **Go to File Manager**
3. **Navigate to your domain's root directory** (usually `public_html/`)
4. **Create a new folder** called `api`
5. **Upload the backend.zip** to the `api` folder
6. **Extract the zip file** in the `api` folder

## Step 3: Set Up Node.js App

1. **In cPanel, go to "Node.js Apps"**
2. **Click "Create Application"**
3. **Fill in the details:**
   - **Node.js version:** 18 or higher
   - **Application mode:** Production
   - **Application root:** `/home/username/public_html/api`
   - **Application URL:** `yourdomain.com/api`
   - **Application startup file:** `index.js`
   - **Passenger port:** Leave default
   - **Environment variables:** Add these:
     ```
     NODE_ENV=production
     PORT=3000
     RATE_LIMIT_PER_MINUTE=60
     ALLOWED_ORIGIN=*
     ```

## Step 4: Install Dependencies and Check Server

1. **In cPanel, go to "Terminal"**
2. **Navigate to your app directory:**
   ```bash
   cd public_html/api
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Make startup script executable:**
   ```bash
   chmod +x start.sh
   ```
5. **Run server diagnostic:**
   ```bash
   node check-server.js
   ```
6. **Start the server with memory management:**
   ```bash
   ./start.sh
   ```

## Step 5: Test Your API

### Test with Postman:

1. **Health Check:**
   ```
   GET https://yourdomain.com/api/health
   ```

2. **Run JavaScript Code:**
   ```
   POST https://yourdomain.com/api/run
   Content-Type: application/json
   
   {
     "language": "javascript",
     "source": "console.log('Hello from cPanel!');"
   }
   ```

3. **Run Python Code:**
   ```
   POST https://yourdomain.com/api/run
   Content-Type: application/json
   
   {
     "language": "python",
     "source": "print('Hello from Python on cPanel!')"
   }
   ```

## Step 6: Troubleshooting

### If you get "Module not found" errors:
1. **Check if all dependencies are installed:**
   ```bash
   cd public_html/api
   npm install
   ```

### If you get permission errors:
1. **Set proper file permissions:**
   ```bash
   chmod 755 public_html/api
   chmod 644 public_html/api/*.js
   ```

### If Python doesn't work:
1. **Check if Python is available on the server:**
   ```bash
   python3 --version
   ```
2. **If not available, contact A2Hosting support** to enable Python

## Step 7: Environment Variables

Make sure these environment variables are set in your Node.js app:

```
NODE_ENV=production
PORT=3000
RATE_LIMIT_PER_MINUTE=60
ALLOWED_ORIGIN=*
```

## Expected API Endpoints:

- `GET /api/health` - Health check
- `POST /api/run` - Execute code
- `POST /api/input` - Send input to running code

## Testing Checklist:

- [ ] Health endpoint responds
- [ ] JavaScript code executes
- [ ] Python code executes
- [ ] Error handling works
- [ ] CORS is properly configured
