@echo off
echo ========================================
echo   Personal Hobby Hub - Starting Server
echo ========================================
echo.
echo Attempting to start local web server...
echo.

REM Try Python 3 first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Python 3...
    echo.
    echo Server will run at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo ========================================
    echo.
    python -m http.server 8000
    goto :end
)

REM Try Python 2
python2 --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Python 2...
    echo.
    echo Server will run at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo ========================================
    echo.
    python2 -m SimpleHTTPServer 8000
    goto :end
)

REM Try PHP
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with PHP...
    echo.
    echo Server will run at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo ========================================
    echo.
    php -S localhost:8000
    goto :end
)

REM No server found
echo ERROR: No suitable server found!
echo.
echo Please install one of the following:
echo   - Python (recommended): https://www.python.org/downloads/
echo   - PHP: https://www.php.net/downloads
echo   - Node.js: https://nodejs.org/
echo.
echo Or use VS Code with Live Server extension
echo.
pause
goto :end

:end
