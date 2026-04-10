@echo off
echo ===========================================
echo    Finalizing Full-Stack Cloud Sync
echo ===========================================
echo.
echo [1/3] Staging production-grade backend changes...
git add .
echo.
echo [2/3] Committing cloud orchestration templates...
git commit -m "chore: full-stack cloud orchestration (render.yaml, cors, prod-props)"
echo.
echo [3/3] Pushing to GitHub (Triggers Render/Vercel)...
git push origin 
echo.
echo ===========================================
echo    Sync Complete!
echo ===========================================
echo.
echo To finish the deployment:
echo 1. Log in to https://dashboard.render.com
echo 2. Click "New" > "Blueprint"
echo 3. Connect your 'ForexQuant-Pro' repository.
echo 4. Render will automatically provision the Backend and MySQL.
echo.
pause
