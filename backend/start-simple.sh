#!/bin/bash

# Simple startup script to avoid WebAssembly memory issues

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Disable problematic Node.js features
export NODE_OPTIONS="--no-experimental-fetch --no-experimental-global-webcrypto"

echo "🚀 Starting Code Editor Backend (Simple Mode)..."
echo "🔧 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"

# Start with minimal memory usage
node --max-old-space-size=128 index.js

