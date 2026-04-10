@echo off
echo Cleaning build artifacts...
rmdir /s /q "target"
rmdir /s /q "..\frontend\dist"
rmdir /s /q "..\frontend\node_modules"
echo Resetting Maven wrapper...
call mvnw.cmd clean
echo Cleanup complete.
