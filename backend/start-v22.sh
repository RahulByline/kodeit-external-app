#!/bin/bash

# Startup script for Node.js v22 - disables problematic features

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Disable problematic Node.js v22 features (only valid flags)
export NODE_OPTIONS="--no-experimental-fetch --no-experimental-global-webcrypto"

echo "🚀 Starting Code Editor Backend with Node.js v22..."
echo "🔧 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"
echo "⚠️  Disabled experimental features to avoid WebAssembly issues"

# Start with minimal memory
node --max-old-space-size=64 index.js
