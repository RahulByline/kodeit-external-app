#!/bin/bash

# Fixed Tux Paint Emulator Startup Script
# This script provides better error handling and diagnostics

set -e

CONTAINER_NAME="tuxpaint-emulator"
IMAGE_NAME="tuxpaint-emulator-simple"
DOCKERFILE="Dockerfile.tuxpaint.simple"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if ports are available
check_ports() {
    local ports=("5901" "6080")
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use. Stopping existing process..."
            sudo lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    done
}

# Function to clean up existing container
cleanup_container() {
    print_status "Cleaning up existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    print_success "Cleanup completed"
}

# Function to build the image
build_image() {
    print_status "Building Tux Paint Docker image..."
    docker build -f $DOCKERFILE -t $IMAGE_NAME .
    if [ $? -eq 0 ]; then
        print_success "Image built successfully!"
    else
        print_error "Failed to build image. Please check the Dockerfile."
        exit 1
    fi
}

# Function to start the container
start_container() {
    print_status "Starting Tux Paint emulator..."
    
    # Clean up any existing container
    cleanup_container
    
    # Start new container
    docker run -d \
        --name $CONTAINER_NAME \
        -p 5901:5901 \
        -p 6080:6080 \
        --restart unless-stopped \
        --privileged \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully!"
    else
        print_error "Failed to start container."
        exit 1
    fi
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for VNC server
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:6080 > /dev/null 2>&1; then
            print_success "noVNC is ready!"
            break
        fi
        
        attempt=$((attempt + 1))
        print_status "Waiting for noVNC... (attempt $attempt/$max_attempts)"
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "noVNC took longer than expected to start. Checking container logs..."
        docker logs $CONTAINER_NAME
    fi
}

# Function to show container status
show_status() {
    print_status "Container status:"
    if docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -q "^${CONTAINER_NAME}"; then
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep "^${CONTAINER_NAME}"
        print_success "Tux Paint is running!"
        print_status "Access URLs:"
        echo "  - VNC Client: localhost:5901"
        echo "  - Web Browser: http://localhost:6080"
        echo "  - In your app: http://localhost:6080"
        
        # Test connectivity
        if curl -s http://localhost:6080 > /dev/null 2>&1; then
            print_success "✓ noVNC is accessible"
        else
            print_warning "⚠ noVNC is not yet accessible"
        fi
    else
        print_warning "Container is not running."
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing container logs (Ctrl+C to exit):"
    docker logs -f $CONTAINER_NAME
}

# Function to restart the container
restart_container() {
    print_status "Restarting Tux Paint emulator..."
    docker restart $CONTAINER_NAME
    wait_for_services
    show_status
}

# Function to diagnose issues
diagnose() {
    print_status "Running diagnostics..."
    
    echo ""
    print_status "1. Checking Docker status:"
    docker info > /dev/null 2>&1 && print_success "✓ Docker is running" || print_error "✗ Docker is not running"
    
    echo ""
    print_status "2. Checking container status:"
    if docker ps | grep -q $CONTAINER_NAME; then
        print_success "✓ Container is running"
        docker ps | grep $CONTAINER_NAME
    else
        print_error "✗ Container is not running"
    fi
    
    echo ""
    print_status "3. Checking port availability:"
    for port in 5901 6080; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_success "✓ Port $port is in use"
        else
            print_warning "⚠ Port $port is not in use"
        fi
    done
    
    echo ""
    print_status "4. Testing noVNC connectivity:"
    if curl -s http://localhost:6080 > /dev/null 2>&1; then
        print_success "✓ noVNC is accessible"
    else
        print_error "✗ noVNC is not accessible"
    fi
    
    echo ""
    print_status "5. Recent container logs:"
    docker logs --tail 20 $CONTAINER_NAME 2>/dev/null || print_warning "No logs available"
}

# Function to stop the container
stop_container() {
    print_status "Stopping Tux Paint emulator..."
    if docker ps --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker stop $CONTAINER_NAME
        print_success "Container stopped successfully!"
    else
        print_warning "Container is not running."
    fi
}

# Function to remove the container
remove_container() {
    print_status "Removing Tux Paint container..."
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker rm -f $CONTAINER_NAME
        print_success "Container removed successfully!"
    else
        print_warning "Container does not exist."
    fi
}

# Function to show help
show_help() {
    echo "Fixed Tux Paint Emulator Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  start     Start the Tux Paint emulator"
    echo "  stop      Stop the Tux Paint emulator"
    echo "  restart   Restart the Tux Paint emulator"
    echo "  remove    Remove the container"
    echo "  status    Show container status"
    echo "  logs      Show container logs"
    echo "  diagnose  Run diagnostics to check for issues"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build     # Build the image"
    echo "  $0 start     # Start the emulator"
    echo "  $0 status    # Check if it's running"
    echo "  $0 diagnose  # Run diagnostics"
    echo "  $0 logs      # View logs"
    echo ""
    echo "Troubleshooting:"
    echo "  If Tux Paint is not working:"
    echo "  1. Run: $0 diagnose"
    echo "  2. Check logs: $0 logs"
    echo "  3. Restart: $0 restart"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        build)
            build_image
            ;;
        start)
            check_ports
            start_container
            wait_for_services
            show_status
            ;;
        stop)
            stop_container
            ;;
        restart)
            restart_container
            ;;
        remove)
            remove_container
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        diagnose)
            diagnose
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"


