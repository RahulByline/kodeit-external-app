#!/bin/bash

# Tux Paint Emulator Startup Script
# This script helps manage the Tux Paint Docker container

set -e

CONTAINER_NAME="tuxpaint-emulator"
IMAGE_NAME="tuxpaint-emulator"
COMPOSE_FILE="docker-compose.tuxpaint.yml"

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
            print_warning "Port $port is already in use. The container may not start properly."
        fi
    done
}

# Function to build the image
build_image() {
    print_status "Building Tux Paint Docker image..."
    docker build -f Dockerfile.tuxpaint -t $IMAGE_NAME .
    print_success "Image built successfully!"
}

# Function to start the container
start_container() {
    print_status "Starting Tux Paint emulator..."
    
    # Check if container already exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        if docker ps --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            print_warning "Container is already running!"
            return
        else
            print_status "Starting existing container..."
            docker start $CONTAINER_NAME
        fi
    else
        print_status "Creating and starting new container..."
        docker run -d \
            --name $CONTAINER_NAME \
            -p 5901:5901 \
            -p 6080:6080 \
            --restart unless-stopped \
            $IMAGE_NAME
    fi
    
    print_success "Container started successfully!"
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

# Function to show container status
show_status() {
    print_status "Container status:"
    if docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -q "^${CONTAINER_NAME}"; then
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep "^${CONTAINER_NAME}"
        print_success "Tux Paint is running!"
        print_status "Access URLs:"
        echo "  - VNC Client: localhost:5901"
        echo "  - Web Browser: http://localhost:6080"
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
    stop_container
    sleep 2
    start_container
}

# Function to show help
show_help() {
    echo "Tux Paint Emulator Management Script"
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
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build    # Build the image"
    echo "  $0 start    # Start the emulator"
    echo "  $0 status   # Check if it's running"
    echo "  $0 logs     # View logs"
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
            show_status
            ;;
        stop)
            stop_container
            ;;
        restart)
            restart_container
            show_status
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

