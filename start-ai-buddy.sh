#!/bin/bash

echo "🚀 Starting My AI Buddy - All Services"
echo

echo "📦 Installing backend dependencies..."
cd backend
npm install
echo

echo "🤖 Starting Ollama server..."
gnome-terminal -- bash -c "ollama serve; exec bash" &
sleep 3

echo "🔧 Starting backend server..."
gnome-terminal -- bash -c "npm run dev; exec bash" &
sleep 3

echo "🎨 Starting frontend..."
cd ..
gnome-terminal -- bash -c "npm run dev; exec bash" &
sleep 3

echo
echo "✅ All services started!"
echo
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🤖 Ollama: http://localhost:11434"
echo
echo "💬 Look for the chat button in the bottom-right corner!"
echo
read -p "Press Enter to continue..." 