@echo off
setlocal
cd /d "%~dp0"
set "NODE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" where node >nul 2>nul || (
  echo Node.js was not found. Please install Node.js or open this prototype from the Codex app.
  pause
  exit /b 1
)
powershell -NoProfile -Command "try { if ((Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/roadster.html').Content -match 'Roadster') { exit 0 } } catch {}; exit 1"
if errorlevel 1 start "Mech Atlas Server" /min cmd /c ""%NODE%" serve.mjs 4173"
for /l %%I in (1,1,20) do (
  powershell -NoProfile -Command "try { if ((Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/roadster.html').Content -match 'Roadster') { exit 0 } } catch {}; exit 1"
  if not errorlevel 1 goto openpage
  timeout /t 1 /nobreak >nul
)
echo The local server did not become ready on port 4173.
pause
exit /b 1
:openpage
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" "http://127.0.0.1:4173/roadster.html#product/roadster"
) else (
  start "" "http://127.0.0.1:4173/roadster.html#product/roadster"
)
endlocal
