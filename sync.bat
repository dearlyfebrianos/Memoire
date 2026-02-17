@echo off
title SYNC FROM GITHUB - MEMOIRE
echo Pulling latest from GitHub...
cd /d "%~dp0"
git pull origin master
echo.
echo SYNCED!
pause