@echo off
setlocal enabledelayedexpansion

REM Tux Paint Emulator Management Script for Windows
REM This script helps manage the Tux Paint Docker container on Windows

set CONTAINER_NAME=tuxpaint-emulator
set IMAGE_NAME=tuxpaint-emulator

REM Function to print colored output
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop and try again."
    exit /b 1
)
goto :eof

REM Function to check if ports are available
:check_ports
netstat -an | find "5901" >nul
if not errorlevel 1 (
    call :print_warning "Port 5901 is already in use. The container may not start properly."
)
netstat -an | find "6080" >nul
if not errorlevel 1 (
    call :print_warning "Port 6080 is already in use. The container may not start properly."
)
goto :eof

REM Function to build the image
:build_image
call :print_status "Building Tux Paint Docker image..."
docker build -f Dockerfile.tuxpaint -t %IMAGE_NAME% .
if errorlevel 1 (
    call :print_error "Failed to build image."
    exit /b 1
)
call :print_success "Image built successfully!"
goto :eof

REM Function to start the container
:start_container
call :print_status "Starting Tux Paint emulator..."

REM Check if container already exists
docker ps -a --format "table {{.Names}}" | find "%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    docker ps --format "table {{.Names}}" | find "%CONTAINER_NAME%" >nul
    if not errorlevel 1 (
        call :print_warning "Container is already running!"
        goto :eof
    ) else (
        call :print_status "Starting existing container..."
        docker start %CONTAINER_NAME%
    )
) else (
    call :print_status "Creating and starting new container..."
    docker run -d --name %CONTAINER_NAME% -p 5901:5901 -p 6080:6080 --restart unless-stopped %IMAGE_NAME%
)

if errorlevel 1 (
    call :print_error "Failed to start container."
    exit /b 1
)
call :print_success "Container started successfully!"
goto :eof

REM Function to stop the container
:stop_container
call :print_status "Stopping Tux Paint emulator..."
docker ps --format "table {{.Names}}" | find "%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    docker stop %CONTAINER_NAME%
    call :print_success "Container stopped successfully!"
) else (
    call :print_warning "Container is not running."
)
goto :eof

REM Function to remove the container
:remove_container
call :print_status "Removing Tux Paint container..."
docker ps -a --format "table {{.Names}}" | find "%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    docker rm -f %CONTAINER_NAME%
    call :print_success "Container removed successfully!"
) else (
    call :print_warning "Container does not exist."
)
goto :eof

REM Function to show container status
:show_status
call :print_status "Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | find "%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | find "%CONTAINER_NAME%"
    call :print_success "Tux Paint is running!"
    call :print_status "Access URLs:"
    echo   - VNC Client: localhost:5901
    echo   - Web Browser: http://localhost:6080
) else (
    call :print_warning "Container is not running."
)
goto :eof

REM Function to show logs
:show_logs
call :print_status "Showing container logs (Ctrl+C to exit):"
docker logs -f %CONTAINER_NAME%
goto :eof

REM Function to restart the container
:restart_container
call :print_status "Restarting Tux Paint emulator..."
call :stop_container
timeout /t 2 /nobreak >nul
call :start_container
goto :eof

REM Function to show help
:show_help
echo Tux Paint Emulator Management Script for Windows
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   build     Build the Docker image
echo   start     Start the Tux Paint emulator
echo   stop      Stop the Tux Paint emulator
echo   restart   Restart the Tux Paint emulator
echo   remove    Remove the container
echo   status    Show container status
echo   logs      Show container logs
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0 build    # Build the image
echo   %~nx0 start    # Start the emulator
echo   %~nx0 status   # Check if it's running
echo   %~nx0 logs     # View logs
goto :eof

REM Main script logic
:main
if "%1"=="" goto :show_help

call :check_docker

if "%1"=="build" (
    call :build_image
) else if "%1"=="start" (
    call :check_ports
    call :start_container
    call :show_status
) else if "%1"=="stop" (
    call :stop_container
) else if "%1"=="restart" (
    call :restart_container
    call :show_status
) else if "%1"=="remove" (
    call :remove_container
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="logs" (
    call :show_logs
) else if "%1"=="help" (
    call :show_help
) else (
    call :print_error "Unknown command: %1"
    call :show_help
    exit /b 1
)

goto :eof

REM Run main function with all arguments
call :main %*

