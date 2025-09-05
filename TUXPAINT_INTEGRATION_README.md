# Tux Paint Emulator Integration

This document describes the integration of Tux Paint emulator into your React + Node.js + Moodle web application.

## 🎯 Overview

The Tux Paint emulator provides students with access to the classic Tux Paint drawing application through a web browser. It uses Docker containers with X11, VNC, and noVNC to run Tux Paint in a virtual desktop environment.

## 📁 Files Created

### Docker & Container Management
- `Dockerfile.tuxpaint` - Docker image for Tux Paint with VNC support
- `docker-compose.tuxpaint.yml` - Docker Compose configuration
- `start-tuxpaint.sh` - Linux/macOS management script
- `start-tuxpaint.bat` - Windows management script
- `TUXPAINT_SETUP.md` - Setup instructions

### React Components
- `src/components/TuxPaintEmulator.tsx` - React component for the emulator
- Updated `src/pages/student/dashboards/G8PlusDashboard.tsx` - Added Tux Paint section
- Updated `src/App.tsx` - Added `/dashboard/student/tux-paint` route
- Updated `src/components/DashboardLayout.tsx` - Added sidebar link

## 🚀 Quick Start

### 1. Build and Start the Emulator

**Linux/macOS:**
```bash
# Make script executable
chmod +x start-tuxpaint.sh

# Build and start
./start-tuxpaint.sh build
./start-tuxpaint.sh start
```

**Windows:**
```cmd
# Build and start
start-tuxpaint.bat build
start-tuxpaint.bat start
```

**Using Docker Compose:**
```bash
docker-compose -f docker-compose.tuxpaint.yml up -d
```

### 2. Access Tux Paint

- **Web Browser**: http://localhost:6080
- **VNC Client**: localhost:5901 (no password)

### 3. Access in Your Application

Navigate to `/dashboard/student/tux-paint` in your React application (requires login).

## 🔧 Configuration

### Port Configuration
- **VNC Port**: 5901 (for VNC clients)
- **noVNC Port**: 6080 (for web browsers)

### Environment Variables
```bash
DISPLAY=:1
VNC_PORT=5901
NOVNC_PORT=6080
```

## 📱 React Integration

### TuxPaintEmulator Component

The `TuxPaintEmulator.tsx` component provides:

- **Authentication Check**: Only logged-in users can access
- **Loading States**: Shows loading spinner while connecting
- **Error Handling**: Displays troubleshooting info if connection fails
- **Fullscreen Support**: Toggle fullscreen mode
- **Refresh Functionality**: Reload the emulator
- **Status Indicators**: Shows connection status

### Features
- ✅ Embedded iframe with noVNC
- ✅ Responsive design
- ✅ Error handling and troubleshooting
- ✅ Fullscreen support
- ✅ Connection status monitoring
- ✅ Authentication protection

## 🛣️ Routing

### New Route Added
```typescript
<Route path="/dashboard/student/tux-paint" element={
  <ProtectedRoute requiredRole="student">
    <Suspense fallback={<LoadingSpinner />}>
      <TuxPaintEmulator />
    </Suspense>
  </ProtectedRoute>
} />
```

### Sidebar Integration
Added "Tux Paint" link to the QUICK ACTIONS section in the student dashboard sidebar.

## 🔒 Security

### Authentication
- Route protected with `ProtectedRoute` component
- Requires student role authentication
- Redirects to login if not authenticated

### Container Security
- VNC server runs without password (development only)
- Container isolated in Docker network
- Optional volume mounting for persistent data

## 🐳 Docker Management

### Container Commands

**Build Image:**
```bash
docker build -f Dockerfile.tuxpaint -t tuxpaint-emulator .
```

**Start Container:**
```bash
docker run -d --name tuxpaint-emulator -p 5901:5901 -p 6080:6080 --restart unless-stopped tuxpaint-emulator
```

**Stop Container:**
```bash
docker stop tuxpaint-emulator
```

**View Logs:**
```bash
docker logs -f tuxpaint-emulator
```

**Remove Container:**
```bash
docker rm -f tuxpaint-emulator
```

### Management Scripts

**Linux/macOS:**
```bash
./start-tuxpaint.sh [command]
```

**Windows:**
```cmd
start-tuxpaint.bat [command]
```

**Available Commands:**
- `build` - Build Docker image
- `start` - Start container
- `stop` - Stop container
- `restart` - Restart container
- `remove` - Remove container
- `status` - Show container status
- `logs` - Show container logs
- `help` - Show help

## 🔍 Troubleshooting

### Common Issues

**1. Container won't start**
```bash
# Check Docker is running
docker info

# Check ports are available
netstat -tulpn | grep :6080
netstat -tulpn | grep :5901

# View container logs
docker logs tuxpaint-emulator
```

**2. Can't access noVNC**
```bash
# Check if container is running
docker ps | grep tuxpaint-emulator

# Check if noVNC is accessible
curl http://localhost:6080

# Restart container
docker restart tuxpaint-emulator
```

**3. Tux Paint not loading**
```bash
# Check X11 and VNC services
docker exec tuxpaint-emulator ps aux | grep x11vnc
docker exec tuxpaint-emulator ps aux | grep Xvfb

# Check Tux Paint process
docker exec tuxpaint-emulator ps aux | grep tuxpaint
```

### Error Messages

**"Connection Failed"**
- Ensure Docker container is running
- Check if ports 5901 and 6080 are available
- Verify noVNC is accessible at http://localhost:6080

**"Container already exists"**
- Use `./start-tuxpaint.sh restart` to restart
- Or `./start-tuxpaint.sh remove` to remove and recreate

## 🎨 Customization

### Styling
The component uses Tailwind CSS classes and can be customized by modifying the `TuxPaintEmulator.tsx` component.

### Configuration
Modify the Dockerfile or startup script to change:
- Screen resolution
- Window manager (currently Fluxbox)
- Tux Paint startup options
- VNC/noVNC configuration

### Integration Points
- Add to different dashboard types (G1-G3, G4-G7)
- Integrate with course activities
- Add to student assignments
- Create drawing competitions

## 📊 Performance

### Resource Usage
- **Memory**: ~200-300MB RAM
- **CPU**: Low usage (X11 + Tux Paint)
- **Storage**: ~500MB (Ubuntu + Tux Paint + noVNC)

### Optimization Tips
- Use container restart policies for auto-recovery
- Monitor resource usage with `docker stats`
- Consider using Docker volumes for persistent data
- Implement connection pooling for multiple users

## 🔄 Updates

### Updating Tux Paint
```bash
# Rebuild image with latest Tux Paint
docker build -f Dockerfile.tuxpaint -t tuxpaint-emulator .

# Restart container
docker restart tuxpaint-emulator
```

### Updating noVNC
Modify the Dockerfile to download the latest noVNC version and rebuild.

## 📝 Development Notes

### Architecture
1. **Docker Container**: Ubuntu with X11, VNC, noVNC, and Tux Paint
2. **VNC Server**: x11vnc provides VNC access to X11 display
3. **noVNC**: WebSocket proxy for browser access
4. **React Component**: iframe embedding with error handling
5. **Authentication**: Protected route with student role check

### Dependencies
- Docker
- Ubuntu 22.04 base image
- Tux Paint package
- X11 utilities (Xvfb, x11vnc)
- Fluxbox window manager
- noVNC (WebSocket VNC client)

## 🎯 Future Enhancements

### Potential Improvements
- [ ] Multi-user support with separate containers
- [ ] Drawing file sharing and collaboration
- [ ] Integration with Moodle assignments
- [ ] Drawing gallery and student portfolios
- [ ] Real-time collaboration features
- [ ] Mobile device support
- [ ] Drawing templates and lessons
- [ ] Assessment and grading integration

### Scaling Considerations
- Use Docker Swarm or Kubernetes for multiple instances
- Implement load balancing for multiple users
- Add persistent storage for drawings
- Consider using WebRTC for better performance

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review container logs
3. Verify Docker and port configuration
4. Test noVNC access directly
5. Check React component error handling

---

**Note**: This integration is designed for educational use. For production environments, consider implementing additional security measures such as VNC authentication and user isolation.

