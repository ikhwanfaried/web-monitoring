@echo off
echo ================================================
echo     SQL Server Connection Test (DB_CONNECTION2)
echo ================================================
echo.

echo Reading configuration from .env file...
echo.

REM Parse .env file to get SQL Server connection details
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="DB_HOST2" set DB_HOST=%%b
    if "%%a"=="DB_DATABASE2" set DB_DATABASE=%%b
    if "%%a"=="DB_USERNAME2" set DB_USERNAME=%%b
    if "%%a"=="DB_PASSWORD2" set DB_PASSWORD=%%b
)

echo Host: %DB_HOST%
echo Database: %DB_DATABASE%
echo Username: %DB_USERNAME%
echo Password: %DB_PASSWORD%
echo ================================================
echo.

:menu
echo Choose test option:
echo.
echo 1. Test basic connection
echo 2. Show database info
echo 3. List tables (first 20)
echo 4. Show database statistics
echo 5. Interactive SQL session
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto test_connection
if "%choice%"=="2" goto database_info
if "%choice%"=="3" goto list_tables
if "%choice%"=="4" goto database_stats
if "%choice%"=="5" goto interactive_session
if "%choice%"=="6" goto exit
goto menu

:test_connection
echo.
echo Testing basic connection...
echo ================================================
sqlcmd -S %DB_HOST% -d %DB_DATABASE% -U %DB_USERNAME% -P %DB_PASSWORD% -Q "SELECT 'Connection successful!' as Status, GETDATE() as CurrentTime"
echo.
pause
goto menu

:database_info
echo.
echo Getting database information...
echo ================================================
sqlcmd -S %DB_HOST% -d %DB_DATABASE% -U %DB_USERNAME% -P %DB_PASSWORD% -Q "SELECT @@VERSION as SqlVersion, DB_NAME() as CurrentDatabase, SYSTEM_USER as CurrentUser, @@SERVICENAME as ServiceName"
echo.
pause
goto menu

:list_tables
echo.
echo Listing first 20 tables...
echo ================================================
sqlcmd -S %DB_HOST% -d %DB_DATABASE% -U %DB_USERNAME% -P %DB_PASSWORD% -Q "SELECT TOP 20 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
echo.
pause
goto menu

:database_stats
echo.
echo Getting database statistics...
echo ================================================
sqlcmd -S %DB_HOST% -d %DB_DATABASE% -U %DB_USERNAME% -P %DB_PASSWORD% -Q "SELECT (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as TableCount, (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS) as ViewCount, (SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE') as ProcedureCount"
echo.
pause
goto menu

:interactive_session
echo.
echo Starting interactive SQL session...
echo Type 'exit' or 'quit' to return to menu
echo ================================================
sqlcmd -S %DB_HOST% -d %DB_DATABASE% -U %DB_USERNAME% -P %DB_PASSWORD%
echo.
echo Interactive session ended.
pause
goto menu

:exit
echo.
echo ================================================
echo Goodbye!
echo ================================================
exit