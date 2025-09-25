<?php
echo "========================================\n";
echo "Testing SQL Server Connection (DB_CONNECTION2)\n";
echo "========================================\n";

// Load .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found');
    }
    
    $env = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, '"');
        $env[$name] = $value;
    }
    
    return $env;
}

try {
    // Load environment variables
    $env = loadEnv('.env');
    
    // SQL Server connection parameters from DB_CONNECTION2
    $host = $env['DB_HOST2'];
    $database = $env['DB_DATABASE2'];
    $username = $env['DB_USERNAME2'];
    $password = $env['DB_PASSWORD2'];
    $port = isset($env['DB_PORT2']) ? $env['DB_PORT2'] : '1433';
    
    echo "Host: $host\n";
    echo "Database: $database\n";
    echo "Username: $username\n";
    echo "Port: $port\n";
    echo "========================================\n";
    
    // Check if SQL Server extension is loaded
    if (!extension_loaded('pdo_sqlsrv')) {
        throw new Exception('SQL Server PDO extension (pdo_sqlsrv) is not installed');
    }
    
    // Build connection string
    $dsn = "sqlsrv:Server=$host,$port;Database=$database";
    
    echo "Attempting connection...\n";
    
    // Create PDO connection
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 10
    ]);
    
    echo "✅ Connection successful!\n\n";
    
    // Test query - Get SQL Server version
    $stmt = $pdo->query("SELECT @@VERSION as SqlVersion, DB_NAME() as CurrentDatabase, SYSTEM_USER as CurrentUser");
    $result = $stmt->fetch();
    
    if ($result) {
        echo "📋 Server Information:\n";
        echo "----------------------------------------\n";
        echo "SQL Server Version: " . substr($result['SqlVersion'], 0, 100) . "...\n";
        echo "Current Database: " . $result['CurrentDatabase'] . "\n";
        echo "Current User: " . $result['CurrentUser'] . "\n\n";
    }
    
    // List tables
    echo "📋 Available Tables:\n";
    echo "----------------------------------------\n";
    $tables = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
    
    $tableCount = 0;
    while ($table = $tables->fetch()) {
        echo "- " . $table['TABLE_NAME'] . "\n";
        $tableCount++;
    }
    
    if ($tableCount == 0) {
        echo "No tables found in database.\n";
    } else {
        echo "\nTotal tables: $tableCount\n";
    }
    
    // Test a simple query
    echo "\n📋 Database Statistics:\n";
    echo "----------------------------------------\n";
    
    try {
        $stmt = $pdo->query("SELECT 
            (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as TableCount,
            (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS) as ViewCount,
            (SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE') as ProcedureCount");
        
        $stats = $stmt->fetch();
        echo "Tables: " . $stats['TableCount'] . "\n";
        echo "Views: " . $stats['ViewCount'] . "\n";
        echo "Stored Procedures: " . $stats['ProcedureCount'] . "\n";
    } catch (Exception $e) {
        echo "Could not retrieve database statistics: " . $e->getMessage() . "\n";
    }
    
    $pdo = null; // Close connection
    
    echo "\n========================================\n";
    echo "✅ Connection test completed successfully!\n";
    echo "========================================\n";
    
} catch (PDOException $e) {
    echo "❌ PDO Connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPossible solutions:\n";
    echo "1. Check if SQL Server is running\n";
    echo "2. Verify host and port are correct\n";
    echo "3. Check username and password\n";
    echo "4. Ensure firewall allows connection\n";
    echo "5. Install Microsoft SQL Server PDO drivers\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";
?>