@echo off
echo ==========================================
echo   Akshara Learning App - Server Startup
echo ==========================================
echo.

:: Start Python backend in a new window
echo Starting Python Speech Recognition Server...
start "Akshara - Python Backend" cmd /k "cd /d %~dp0python_backend && python server.py"

:: Wait a moment for Python server to start
timeout /t 3 /nobreak > nul

:: Start Next.js frontend
echo Starting Next.js Frontend Server...
start "Akshara - Next.js Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ==========================================
echo   Both servers are starting!
echo ==========================================
echo.
echo   Python Backend: http://localhost:8000
echo   Next.js Frontend: http://localhost:3000
echo.
echo   Open http://localhost:3000 in your browser
echo   to use the Akshara Learning App.
echo ==========================================
echo.
pause
