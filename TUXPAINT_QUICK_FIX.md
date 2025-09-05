# 🚀 Tux Paint Quick Fix Guide

If Tux Paint is not working, follow these steps to get it functioning properly:

## 🔧 Step-by-Step Fix

### 1. **Stop Any Existing Containers**
```bash
# Linux/macOS
./start-tuxpaint-fixed.sh stop
./start-tuxpaint-fixed.sh remove

# Windows
start-tuxpaint-fixed.bat stop
start-tuxpaint-fixed.bat remove
```

### 2. **Build the Fixed Image**
```bash
# Linux/macOS
chmod +x start-tuxpaint-fixed.sh
./start-tuxpaint-fixed.sh build

# Windows
start-tuxpaint-fixed.bat build
```

### 3. **Start the Emulator**
```bash
# Linux/macOS
./start-tuxpaint-fixed.sh start

# Windows
start-tuxpaint-fixed.bat start
```

### 4. **Verify It's Working**
```bash
# Check status
./start-tuxpaint-fixed.sh status

# Run diagnostics
./start-tuxpaint-fixed.sh diagnose
```

## 🌐 Access Tux Paint

Once running, you can access Tux Paint in three ways:

1. **Direct Browser Access**: http://localhost:6080
2. **In Your React App**: Navigate to `/dashboard/student/tux-paint`
3. **VNC Client**: localhost:5901 (no password)

## 🔍 Troubleshooting

### If Still Not Working:

#### **1. Check Docker Status**
```bash
docker info
docker ps
```

#### **2. Check Ports**
```bash
# Linux/macOS
netstat -tulpn | grep :6080
netstat -tulpn | grep :5901

# Windows
netstat -an | find ":6080"
netstat -an | find ":5901"
```

#### **3. View Container Logs**
```bash
./start-tuxpaint-fixed.sh logs
```

#### **4. Run Full Diagnostics**
```bash
./start-tuxpaint-fixed.sh diagnose
```

### Common Issues & Solutions:

#### **Issue: "Port already in use"**
```bash
# Kill processes using the ports
sudo lsof -ti:6080 | xargs kill -9
sudo lsof -ti:5901 | xargs kill -9
```

#### **Issue: "Container won't start"**
```bash
# Check Docker has enough resources
docker system prune -f
docker volume prune -f
```

#### **Issue: "noVNC not accessible"**
```bash
# Restart the container
./start-tuxpaint-fixed.sh restart
```

## ✅ Success Indicators

You'll know Tux Paint is working when:

1. ✅ Container shows as "running" in `docker ps`
2. ✅ http://localhost:6080 loads in browser
3. ✅ You can see the noVNC interface
4. ✅ Tux Paint application is visible and functional
5. ✅ You can draw and use Tux Paint tools

## 🎯 Quick Test

1. Open http://localhost:6080 in your browser
2. You should see a desktop environment
3. Tux Paint should be running and visible
4. Try drawing with the mouse/touch
5. Test the different tools (brush, stamps, etc.)

## 📞 Still Having Issues?

If Tux Paint still doesn't work after following these steps:

1. **Check your Docker version**: `docker --version`
2. **Ensure Docker Desktop is running** (Windows/macOS)
3. **Try restarting Docker**: Restart Docker Desktop
4. **Check system resources**: Ensure you have enough RAM/CPU
5. **Run diagnostics**: `./start-tuxpaint-fixed.sh diagnose`

## 🔄 Alternative: Manual Docker Commands

If the scripts don't work, try manual commands:

```bash
# Build image
docker build -f Dockerfile.tuxpaint.simple -t tuxpaint-emulator-simple .

# Run container
docker run -d --name tuxpaint-emulator -p 5901:5901 -p 6080:6080 --restart unless-stopped --privileged tuxpaint-emulator-simple

# Check logs
docker logs -f tuxpaint-emulator
```

---

**Note**: The fixed version uses a simpler, more reliable Dockerfile and includes better error handling and diagnostics to help identify and resolve issues quickly.


