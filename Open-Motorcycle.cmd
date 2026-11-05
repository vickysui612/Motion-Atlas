@echo off
cd /d "%~dp0"
if not exist "%~dp0motorcycle.html" (
 echo Please extract the complete ZIP before starting.
 pause
 exit /b 1
)
where python >nul 2>nul
if errorlevel 1 (
 py -3 "%~dp0open_motorcycle.py"
) else (
 python "%~dp0open_motorcycle.py"
)
pause
