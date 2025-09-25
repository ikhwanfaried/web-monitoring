@echo off
echo ================================================
echo     Web Monitoring Clone - Development Helper
echo ================================================
echo.

:menu
echo Pilih aksi yang ingin dilakukan:
echo.
echo 1. Install dependencies (composer + npm)
echo 2. Generate application key
echo 3. Setup database (buka setup_database.sql)
echo 4. Run Laravel development server (port 8001)
echo 5. Run vite dev server
echo 6. Test API endpoints
echo 7. Exit
echo.
set /p choice="Masukkan pilihan (1-7): "

if "%choice%"=="1" goto install_deps
if "%choice%"=="2" goto generate_key
if "%choice%"=="3" goto setup_db
if "%choice%"=="4" goto run_server
if "%choice%"=="5" goto run_vite
if "%choice%"=="6" goto test_api
if "%choice%"=="7" goto exit
goto menu

:install_deps
echo Installing Composer dependencies...
composer install
echo.
echo Installing NPM dependencies...
npm install
echo.
echo Dependencies installed!
pause
goto menu

:generate_key
echo Generating application key...
php artisan key:generate
echo Application key generated!
pause
goto menu

:setup_db
echo Opening database setup script...
echo Please run setup_database.sql in your MySQL client
start setup_database.sql
pause
goto menu

:run_server
echo Starting Laravel development server on port 8001...
echo Access your application at: http://127.0.0.1:8001
echo Press Ctrl+C to stop the server
php artisan serve --port=8001
pause
goto menu

:run_vite
echo Starting Vite development server...
npm run dev
pause
goto menu

:test_api
echo Testing API endpoints...
echo.
echo Opening test files...
start http://127.0.0.1:8001/test_stock_api.html
echo.
echo You can also test these files:
echo - test_api_stock_detail.php
echo - test_login_curl.php  
echo - test_create_user_curl.php
echo - test_api_transaction.php
pause
goto menu

:exit
echo Goodbye!
exit