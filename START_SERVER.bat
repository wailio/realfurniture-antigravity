@echo off
title [NEW CLIENT BUSINESS NAME] - Dev Server
echo.
echo  Starting dev server...
echo  Open your browser at: http://localhost:3000
echo.
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
npm.cmd run dev
pause
