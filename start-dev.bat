@echo off
REM Quick Start Script for Dataforge Application
REM This script helps you get the application running quickly

setlocal enabledelayedexpansion

echo ========================================
echo   Dataforge - Quick Start Script
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ERROR: Please run this script from the Dataforge root directory
    echo.
    echo Current directory: %cd%
    echo.
    echo Expected structure:
    echo   - backend/
    echo   - frontend/
    echo   - docker-compose.yml
    exit /b 1
)

echo.
echo Choose what to do:
echo.
echo [1] Install all dependencies (backend + frontend)
echo [2] Start backend server only
echo [3] Start frontend server only
echo [4] Start both servers (recommended)
echo [5] Clean and reinstall dependencies
echo [6] Run backend tests
echo [7] View setup instructions
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    call :install_deps
    pause
) else if "%choice%"=="2" (
    call :start_backend
) else if "%choice%"=="3" (
    call :start_frontend
) else if "%choice%"=="4" (
    call :start_both
) else if "%choice%"=="5" (
    call :clean_install
    pause
) else if "%choice%"=="6" (
    call :run_tests
    pause
) else if "%choice%"=="7" (
    call :show_instructions
) else (
    echo Invalid choice. Please run the script again.
    exit /b 1
)

exit /b 0

REM ===== Function Definitions =====

:install_deps
    echo.
    echo Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    cd ..
    echo.
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
    echo ✅ All dependencies installed!
    echo.
    goto :eof

:start_backend
    echo.
    echo Starting backend server...
    echo Listening on: http://127.0.0.1:8000
    echo API Docs: http://127.0.0.1:8000/docs
    echo.
    cd backend
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    goto :eof

:start_frontend
    echo.
    echo Starting frontend server...
    echo Listening on: http://localhost:5173
    echo.
    cd frontend
    call npm run dev
    goto :eof

:start_both
    echo.
    echo To run both servers, open TWO separate command prompts:
    echo.
    echo Terminal 1:
    echo   cd backend
    echo   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    echo.
    echo Terminal 2:
    echo   cd frontend
    echo   npm run dev
    echo.
    echo Then open your browser to: http://localhost:5173
    echo.
    pause
    goto :eof

:clean_install
    echo.
    echo Cleaning and reinstalling...
    echo.
    
    echo Removing backend node_modules and cache...
    cd backend
    if exist "__pycache__" rmdir /s /q __pycache__
    if exist ".pytest_cache" rmdir /s /q .pytest_cache
    pip install -r requirements.txt --force-reinstall
    python -m spacy download en_core_web_sm
    cd ..
    
    echo.
    echo Removing frontend node_modules...
    cd frontend
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    call npm install
    cd ..
    
    echo.
    echo ✅ Clean reinstall complete!
    goto :eof

:run_tests
    echo.
    echo Running backend tests...
    cd backend
    pytest -v
    cd ..
    goto :eof

:show_instructions
    echo.
    echo ========================================
    echo   Setup Instructions
    echo ========================================
    echo.
    echo 1. INSTALL DEPENDENCIES
    echo    - Run option [1] above or:
    echo      cd backend ^&^& pip install -r requirements.txt
    echo      python -m spacy download en_core_web_sm
    echo      cd ..\frontend ^&^& npm install
    echo.
    echo 2. START SERVERS (in SEPARATE terminals)
    echo.
    echo    Terminal 1 (Backend):
    echo      cd backend
    echo      python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    echo.
    echo    Terminal 2 (Frontend):
    echo      cd frontend
    echo      npm run dev
    echo.
    echo 3. OPEN APPLICATION
    echo    - Open browser to: http://localhost:5173
    echo    - API Docs at: http://localhost:8000/docs
    echo.
    echo 4. UPLOAD DOCUMENTS
    echo    - Drag and drop PDF/TXT/MD files
    echo    - Click "Upload & Index Documents"
    echo    - See real-time progress
    echo.
    echo 5. QUERY THE KNOWLEDGE BASE
    echo    - Type your question
    echo    - See answer with knowledge graph
    echo.
    echo TROUBLESHOOTING:
    echo ================
    echo "Connection refused" = Backend not running
    echo "Cannot find module" = Run: npm install
    echo "Port in use" = Another app using port 8000/5173
    echo.
    echo For more help, see:
    echo   - SETUP_RUN.md (full setup guide)
    echo   - UPLOAD_IMPROVEMENTS.md (UI/UX improvements)
    echo   - BEAUTIFUL_UI_GUIDE.md (visual design guide)
    echo.
    pause
    goto :eof
