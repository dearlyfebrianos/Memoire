@echo off
title AUTO PUSH - MEMOIRE

echo =====================================
echo     MEMOIRE - FORCE PUSH SCRIPT
echo =====================================
echo.

cd /d "%~dp0"

echo Adding files...
git add .

echo Committing...
git commit -m "Memoire - Personal Memories"

echo Pushing to master with FORCE...
git push -u origin master

echo.
echo DONE!
pause
cls