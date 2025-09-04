@echo off
echo ==========================================
echo   Web Monitoring Development Helper
echo ==========================================
echo.
echo Pilihan:
echo 1. Build Production dan Jalankan Laravel Server
echo 2. Development Mode (Laravel + Vite bersamaan)
echo 3. Hanya Build Production
echo 4. Hanya Jalankan Laravel Server
echo.
set /p choice="Pilih opsi (1-4): "

if "%choice%"=="1" (
    echo.
    echo [1/2] Building production assets...
    call npm run build
    if errorlevel 1 (
        echo Error building assets!
        pause
        exit /b 1
    )
    echo.
    echo [2/2] Starting Laravel server...
    php artisan serve
) else if "%choice%"=="2" (
    echo.
    echo PERINGATAN: Mode ini mungkin menyebabkan konflik!
    echo Pastikan tidak ada Laravel server yang berjalan.
    echo.
    pause
    start "Vite Server" cmd /k "npm run dev"
    timeout /t 5
    start "Laravel Server" cmd /k "php artisan serve --port=8001"
    echo.
    echo Servers started:
    echo - Vite: http://localhost:5173
    echo - Laravel: http://127.0.0.1:8001
) else if "%choice%"=="3" (
    echo.
    echo Building production assets...
    call npm run build
) else if "%choice%"=="4" (
    echo.
    echo Starting Laravel server...
    php artisan serve
) else (
    echo Invalid option!
    pause
)
