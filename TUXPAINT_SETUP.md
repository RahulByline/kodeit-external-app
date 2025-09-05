# Tux Paint Emulator Setup Instructions

## Prerequisites
- Docker installed on your system
- Ports 5901 and 6080 available

## Quick Setup

### 1. Build the Docker Image
```bash
docker build -f Dockerfile.tuxpaint -t tuxpaint-emulator .
```

### 2. Run the Container
```bash
docker run -d \
  --name tuxpaint-emulator \
  -p 5901:5901 \
  -p 6080:6080 \
  --restart unless-stopped \
  tuxpaint-emulator
```

### 3. Access Tux Paint
- **VNC Client**: `localhost:5901` (no password)
- **Web Browser**: `http://localhost:6080`

## Container Management

### Start the container
```bash
docker start tuxpaint-emulator
```

### Stop the container
```bash
docker stop tuxpaint-emulator
```

### View logs
```bash
docker logs tuxpaint-emulator
```

### Remove container
```bash
docker stop tuxpaint-emulator
docker rm tuxpaint-emulator
```

## Troubleshooting

### If Tux Paint doesn't start
1. Check container logs: `docker logs tuxpaint-emulator`
2. Ensure ports are not in use: `netstat -tulpn | grep :6080`
3. Restart container: `docker restart tuxpaint-emulator`

### If noVNC connection fails
1. Verify VNC server is running: `docker exec tuxpaint-emulator ps aux | grep x11vnc`
2. Check noVNC logs: `docker exec tuxpaint-emulator ps aux | grep launch.sh`
3. Ensure WebSocket is accessible at `ws://localhost:6080`

## Integration with React App

The React component will connect to `http://localhost:6080` to display Tux Paint in an iframe. Make sure the container is running before accessing the `/tux-paint` route in your application.

## Security Notes

- VNC server runs without password (for development)
- Consider adding authentication for production use
- Container runs as root (acceptable for development environment)

