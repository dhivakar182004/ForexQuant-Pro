@echo off
echo ==========================================
echo    Deploying ForexQuant Pro Environment
echo ==========================================
echo.
echo [1/3] Spinning up MySQL Database Layer (forexquant:3306)
echo [2/3] Compiling Java Spring Boot Backend Container (:8081)
echo [3/3] Emitting Nginx React Frontend Reverse-Proxy (:80)
echo.
echo Building unified docker orchestration...
docker-compose up --build -d
echo.
echo ==========================================
echo Deployment Successful!
echo.
echo [User Interface]  http://localhost
echo [API Layer]       http://localhost:8081
echo ==========================================
pause
