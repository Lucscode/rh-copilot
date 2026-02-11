@echo off
echo Iniciando RH Copilot...
echo.
echo Servidor: http://localhost:8000
echo.

cd /d "%~dp0"
python -m uvicorn backend.src.app.main:app --host 0.0.0.0 --port 8000

pause
