@echo off
setlocal enabledelayedexpansion

REM Fixed Tux Paint Emulator Management Script for Windows
REM This script provides better error handling and diagnostics

set CONTAINER_NAME=tuxpaint-emulator
set IMAGE_NAME=tuxpaint-emulator-simple
set DOCKERFILE=Dockerfile.tuxpaint.simple

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
    call :print_warning "Port 5901 is already in use. Stopping existing process..."
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":5901"') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)
netstat -an | find "6080" >nul
if not errorlevel 1 (
    call :print_warning "Port 6080 is already in use. Stopping existing process..."
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":6080"') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)
goto :eof

REM Function to clean up existing container
:cleanup_container
call :print_status "Cleaning up existing container..."
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1
call :print_success "Cleanup completed"
goto :eof

REM Function to build the image
:build_image
call :print_status "Building Tux Paint Docker image..."
docker build -f %DOCKERFILE% -t %IMAGE_NAME% .
if errorlevel 1 (
    call :print_error "Failed to build image. Please check the Dockerfile."
    exit /b 1
)
call :print_success "Image built successfully!"
goto :eof

REM Function to start the container
:start_container
call :print_status "Starting Tux Paint emulator..."

REM Clean up any existing container
call :cleanup_container

REM Start new container
docker run -d --name %CONTAINER_NAME% -p 5901:5901 -p 6080:6080 --restart unless-stopped --privileged %IMAGE_NAME%

if errorlevel 1 (
    call :print_error "Failed to start container."
    exit /b 1
)
call :print_success "Container started successfully!"
goto :eof

REM Function to wait for services to be ready
:wait_for_services
call :print_status "Waiting for services to be ready..."

REM Wait for noVNC
set max_attempts=30
set attempt=0

:wait_loop
curl -s http://localhost:6080 >nul 2>&1
if not errorlevel 1 (
    call :print_success "noVNC is ready!"
    goto :wait_done
)

set /a attempt+=1
call :print_status "Waiting for noVNC... (attempt %attempt%/%max_attempts%)"
timeout /t 2 /nobreak >nul

if %attempt% lss %max_attempts% goto :wait_loop

call :print_warning "noVNC took longer than expected to start. Checking container logs..."
docker logs %CONTAINER_NAME%

:wait_done
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
    echo   - In your app: http://localhost:6080
    
    REM Test connectivity
    curl -s http://localhost:6080 >nul 2>&1
    if not errorlevel 1 (
        call :print_success "✓ noVNC is accessible"
    ) else (
        call :print_warning "⚠ noVNC is not yet accessible"
    )
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
docker restart %CONTAINER_NAME%
call :wait_for_services
call :show_status
goto :eof

REM Function to diagnose issues
:diagnose
call :print_status "Running diagnostics..."

echo.
call :print_status "1. Checking Docker status:"
docker info >nul 2>&1
if not errorlevel 1 (
    call :print_success "✓ Docker is running"
) else (
    call :print_error "✗ Docker is not running"
)

echo.
call :print_status "2. Checking container status:"
docker ps | find "%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    call :print_success "✓ Container is running"
    docker ps | find "%CONTAINER_NAME%"
) else (
    call :print_error "✗ Container is not running"
)

echo.
call :print_status "3. Checking port availability:"
for %%p in (5901 6080) do (
    netstat -an | find ":%%p" >nul
    if not errorlevel 1 (
        call :print_success "✓ Port %%p is in use"
    ) else (
        call :print_warning "⚠ Port %%p is not in use"
    )
)

echo.
call :print_status "4. Testing noVNC connectivity:"
curl -s http://localhost:6080 >nul 2>&1
if not errorlevel 1 (
    call :print_success "✓ noVNC is accessible"
) else (
    call :print_error "✗ noVNC is not accessible"
)

echo.
call :print_status "5. Recent container logs:"
docker logs --tail 20 %CONTAINER_NAME% 2>nul || call :print_warning "No logs available"
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

REM Function to show help
:show_help
echo Fixed Tux Paint Emulator Management Script for Windows
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
echo   diagnose  Run diagnostics to check for issues
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0 build     # Build the image
echo   %~nx0 start     # Start the emulator
echo   %~nx0 status    # Check if it's running
echo   %~nx0 diagnose  # Run diagnostics
echo   %~nx0 logs      # View logs
echo.
echo Troubleshooting:
echo   If Tux Paint is not working:
echo   1. Run: %~nx0 diagnose
echo   2. Check logs: %~nx0 logs
echo   3. Restart: %~nx0 restart
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
    call :wait_for_services
    call :show_status
) else if "%1"=="stop" (
    call :stop_container
) else if "%1"=="restart" (
    call :restart_container
) else if "%1"=="remove" (
    call :remove_container
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="logs" (
    call :show_logs
) else if "%1"=="diagnose" (
    call :diagnose
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


