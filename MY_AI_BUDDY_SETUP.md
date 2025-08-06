# My AI Buddy - Setup Guide

## 🚀 Overview

My AI Buddy is a professional AI chatbot integrated into your full-stack React application. It uses Ollama with the Mistral model for local AI processing.

## 📋 Prerequisites

1. **Ollama installed and running** with Mistral model
2. **Node.js** (v16 or higher)
3. **Your React app** (already set up)

## 🔧 Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. The React component is already integrated

The `MyAIBuddy.tsx` component is already:
- ✅ Created in `src/components/MyAIBuddy.tsx`
- ✅ Integrated into `src/App.tsx`
- ✅ Uses your existing UI components (shadcn/ui)

### 2. Start the Frontend

```bash
# In your project root
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🤖 Ollama Setup

### 1. Install Ollama

Visit [ollama.ai](https://ollama.ai) and install Ollama for your platform.

### 2. Pull the Mistral Model

```bash
ollama pull mistral
```

### 3. Start Ollama

```bash
ollama serve
```

Ollama will run on `http://localhost:11434`

## 🎯 How to Use

1. **Start all services:**
   - Ollama server (`ollama serve`)
   - Backend (`cd backend && npm run dev`)
   - Frontend (`npm run dev`)

2. **Open your app** at `http://localhost:3000`

3. **Look for the chat button** in the bottom-right corner

4. **Click the chat button** to open My AI Buddy

5. **Start chatting!** The chatbot will:
   - Maintain conversation context
   - Show loading animations
   - Display timestamps and source info
   - Support both English and Arabic

## 🏗️ Architecture

```
Frontend (React) → Backend (Express) → Ollama (Mistral)
     ↓                    ↓                    ↓
localhost:3000    localhost:5000      localhost:11434
```

## 📁 File Structure

```
backend/
├── package.json          # Backend dependencies
└── index.js             # Express server with /chat endpoint

src/
├── components/
│   └── MyAIBuddy.tsx   # React chatbot component
└── App.tsx              # Main app (already integrated)
```

## 🔧 Features

### Backend Features
- ✅ POST `/chat` endpoint
- ✅ Conversation memory (last 20 messages)
- ✅ Error handling
- ✅ CORS enabled
- ✅ Structured JSON responses
- ✅ Health check endpoint

### Frontend Features
- ✅ Floating chat button
- ✅ Professional UI with shadcn/ui
- ✅ Real-time messaging
- ✅ Loading animations
- ✅ Auto-scroll to latest messages
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Keyboard shortcuts (Enter to send)
- ✅ Error handling

## 🐛 Troubleshooting

### Backend Issues
1. **Port 5000 already in use:**
   ```bash
   # Change port in backend/index.js
   const PORT = 5001; // or any available port
   ```

2. **Ollama connection failed:**
   - Ensure Ollama is running: `ollama serve`
   - Check if Mistral model is installed: `ollama list`

### Frontend Issues
1. **Chat button not appearing:**
   - Check browser console for errors
   - Ensure MyAIBuddy component is imported in App.tsx

2. **Messages not sending:**
   - Verify backend is running on correct port
   - Check network tab for API errors

## 🎨 Customization

### Change Chatbot Position
Edit `MyAIBuddy.tsx`:
```tsx
// Change from bottom-right to bottom-left
className="fixed bottom-6 left-6 w-96 h-[600px] z-50"
```

### Change Chatbot Size
```tsx
// Make it wider
className="fixed bottom-6 right-6 w-[500px] h-[700px] z-50"
```

### Change AI Model
Edit `backend/index.js`:
```javascript
// Change from mistral to another model
model: 'llama2', // or any other model you have
```

## 🚀 Production Deployment

### Backend Deployment
1. Use PM2 or similar process manager
2. Set up environment variables
3. Use a proper database for conversation storage

### Frontend Deployment
1. Build the app: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all services are running
3. Ensure Ollama has the Mistral model installed

---

**Happy chatting with My AI Buddy! 🤖✨** 