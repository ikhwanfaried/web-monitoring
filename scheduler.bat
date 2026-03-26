@echo off
REM ========================================
REM Laravel Scheduler for SQL Server Sync
REM STATUS: DISABLED - For Future Use
REM ========================================
REM 
REM IMPORTANT: This scheduler is prepared but NOT ACTIVE
REM Enable this only when SQL Server access is granted
REM 
REM To enable:
REM 1. Uncomment scheduler in bootstrap/app.php
REM 2. Test manually: php artisan sync:sqlserver
REM 3. Setup Windows Task Scheduler to run this .bat file every minute
REM 
REM ========================================

cd /d E:\XAMPP\htdocs\web-monitoring
php artisan schedule:run >> storage\logs\scheduler.log 2>&1
