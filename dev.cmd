@echo off
set "PATH=C:\Users\H Street\AppData\Local\node-portable\node-v22.14.0-win-x64;%PATH%"
cd /d "%~dp0"
node node_modules\next\dist\bin\next dev -p 3050
