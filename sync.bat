@echo off
title SYNC PHOTOS - MEMOIRE
echo =====================================
echo   MEMOIRE - SYNC PHOTOS FROM GITHUB
echo =====================================
echo.

cd /d "%~dp0"

echo Fetching latest from GitHub...
git fetch origin master

echo.
echo Updating photos.js...
git checkout origin/master -- src/data/photos.js

echo.
echo SYNCED! photos.js sudah terupdate.
pause