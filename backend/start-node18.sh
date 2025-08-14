#!/bin/bash

# Startup script for Node.js v18 (more stable)

# Set environment variables
export NODE_ENV=production
export PORT=3000

echo "🚀 Starting Code Editor Backend with Node.js v18..."
echo "🔧 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"

# Use Node.js v18 specifically
nvm use 18
node index.js

