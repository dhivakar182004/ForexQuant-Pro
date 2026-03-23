@echo off
echo ==========================================
echo    Deploying ForexQuant Pro to Vercel
echo ==========================================
echo.
echo [1/3] Installing Vercel CLI (This might take a moment)...
call npm install -g vercel
echo.
echo [2/3] Logging you into Vercel...
echo Please follow the prompts to log in (it will open your browser).
call vercel login
echo.
echo [3/3] Deploying project...
call vercel --prod
echo.
echo ==========================================
echo    Deployment finished! You can close this window.
echo ==========================================
pause
