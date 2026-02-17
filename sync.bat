@echo off
title SYNC FROM GITHUB - MEMOIRE
echo Pulling latest from GitHub...
cd /d "%~dp0"
git checkout origin/master -- src/data/photos.js
echo.
echo SYNCED!
pause