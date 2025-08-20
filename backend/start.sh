#!/bin/bash

# Set Node.js memory limits and disable problematic modules
export NODE_OPTIONS="--max-old-space-size=256 --no-experimental-fetch"

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start the application
echo "🚀 Starting Code Editor Backend..."
echo "💾 Memory limit: 256MB"
echo "🔧 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"

# Try to use Node.js v18 if available, otherwise use current version
if command -v node18 &> /dev/null; then
    echo "🟢 Using Node.js v18"
    node18 index.js
elif command -v node20 &> /dev/null; then
    echo "🟢 Using Node.js v20"
    node20 index.js
else
    echo "⚠️  Using current Node.js version (may have memory issues)"
    node index.js
fi
