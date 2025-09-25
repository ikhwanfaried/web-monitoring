# SQL Server Connection Test Script
# Reads configuration from .env file

Write-Host "========================================" -ForegroundColor Green
Write-Host "Testing SQL Server Connection (DB_CONNECTION2)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

try {
    # Read .env file
    if (-not (Test-Path ".env")) {
        throw "File .env tidak ditemukan"
    }
    
    $envContent = Get-Content ".env"
    $envVars = @{}
    
    foreach ($line in $envContent) {
        if ($line -match "^([^#].*)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim('"')
            $envVars[$key] = $value
        }
    }
    
    # SQL Server connection parameters from DB_CONNECTION2
    $ServerInstance = $envVars["DB_HOST2"]
    $Database = $envVars["DB_DATABASE2"] 
    $Username = $envVars["DB_USERNAME2"]
    $Password = $envVars["DB_PASSWORD2"]
    $Port = if ($envVars["DB_PORT2"]) { $envVars["DB_PORT2"] } else { "1433" }
    
    Write-Host "Host: $ServerInstance" -ForegroundColor Yellow
    Write-Host "Database: $Database" -ForegroundColor Yellow
    Write-Host "Username: $Username" -ForegroundColor Yellow
    Write-Host "Port: $Port" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
    
    # Build connection string
    $connectionString = "Server=$ServerInstance,$Port;Database=$Database;User Id=$Username;Password=$Password;TrustServerCertificate=True;Connection Timeout=10;"
    
    Write-Host "Attempting connection..." -ForegroundColor Cyan
    
    # Create SQL connection
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    # Test query - Get SQL Server version and info
    $command = $connection.CreateCommand()
    $command.CommandText = @"
SELECT 
    @@VERSION as SqlVersion,
    DB_NAME() as CurrentDatabase,
    SYSTEM_USER as CurrentUser,
    @@SERVICENAME as ServiceName
"@
    
    $reader = $command.ExecuteReader()
    
    if ($reader.Read()) {
        Write-Host "📋 Server Information:" -ForegroundColor Cyan
        Write-Host "----------------------------------------" -ForegroundColor Gray
        $version = $reader["SqlVersion"].ToString()
        $shortVersion = if ($version.Length -gt 100) { $version.Substring(0, 100) + "..." } else { $version }
        Write-Host "SQL Server Version: $shortVersion" -ForegroundColor White
        Write-Host "Current Database: $($reader["CurrentDatabase"])" -ForegroundColor White
        Write-Host "Current User: $($reader["CurrentUser"])" -ForegroundColor White
        Write-Host "Service Name: $($reader["ServiceName"])" -ForegroundColor White
        Write-Host ""
    }
    
    $reader.Close()
    
    # List tables
    Write-Host "📋 Available Tables:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    $command.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
    $reader = $command.ExecuteReader()
    
    $tableCount = 0
    while ($reader.Read()) {
        Write-Host "- $($reader["TABLE_NAME"])" -ForegroundColor White
        $tableCount++
    }
    
    $reader.Close()
    
    if ($tableCount -eq 0) {
        Write-Host "No tables found in database." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "Total tables: $tableCount" -ForegroundColor Green
    }
    
    # Database statistics
    Write-Host ""
    Write-Host "📋 Database Statistics:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    $command.CommandText = @"
SELECT 
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as TableCount,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS) as ViewCount,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE') as ProcedureCount
"@
    
    $reader = $command.ExecuteReader()
    
    if ($reader.Read()) {
        Write-Host "Tables: $($reader["TableCount"])" -ForegroundColor White
        Write-Host "Views: $($reader["ViewCount"])" -ForegroundColor White
        Write-Host "Stored Procedures: $($reader["ProcedureCount"])" -ForegroundColor White
    }
    
    $reader.Close()
    $connection.Close()
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Connection test completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Connection failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "1. Check if SQL Server is running" -ForegroundColor White
    Write-Host "2. Verify host and port are correct" -ForegroundColor White
    Write-Host "3. Check username and password" -ForegroundColor White
    Write-Host "4. Ensure firewall allows connection" -ForegroundColor White
    Write-Host "5. Check network connectivity" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"