@echo off
echo ========================================
echo Deploying booking-saas to Railway
echo ========================================

cd /d E:\CodelocalLLM\booking-saas

echo.
echo [1/5] Linking to project...
railway link

echo.
echo [2/5] Deploying app...
railway up

echo.
echo [3/5] Getting domain...
railway domain

echo.
echo [4/5] Running database migrations...
railway run npx prisma migrate deploy

echo.
echo [5/5] Opening dashboard...
railway open

echo.
echo ========================================
echo Deployment complete!
echo ========================================
pause
