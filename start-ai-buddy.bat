@echo off
echo 🚀 Starting My AI Buddy - All Services
echo.

echo 📦 Installing backend dependencies...
cd backend
npm install
echo.

echo 🤖 Starting Ollama server...
start "Ollama Server" cmd /k "ollama serve"
timeout /t 3 /nobreak >nul

echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend...
cd ..
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ✅ All services started!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🤖 Ollama: http://localhost:11434
echo.
echo 💬 Look for the chat button in the bottom-right corner!
echo.
pause 