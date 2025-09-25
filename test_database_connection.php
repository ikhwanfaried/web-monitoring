<?php
echo "========================================\n";
echo "Testing Database Connection (web_mon)\n";
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
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, '"');
            $env[$name] = $value;
        }
    }
    
    return $env;
}

try {
    // Load environment variables
    $env = loadEnv('.env');
    
    // MySQL connection parameters
    $host = $env['DB_HOST'];
    $database = $env['DB_DATABASE'];
    $username = $env['DB_USERNAME'];
    $password = $env['DB_PASSWORD'];
    $port = $env['DB_PORT'];
    
    echo "Host: $host\n";
    echo "Database: $database\n";
    echo "Username: $username\n";
    echo "Port: $port\n";
    echo "========================================\n";
    
    // Build connection string
    $dsn = "mysql:host=$host;port=$port;dbname=$database";
    
    echo "Attempting connection...\n";
    
    // Create PDO connection
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 10
    ]);
    
    echo "✅ Connection successful!\n\n";
    
    // Test query - Get MySQL version
    $stmt = $pdo->query("SELECT VERSION() as MysqlVersion, DATABASE() as CurrentDatabase, USER() as CurrentUser");
    $result = $stmt->fetch();
    
    if ($result) {
        echo "📋 Server Information:\n";
        echo "----------------------------------------\n";
        echo "MySQL Version: " . $result['MysqlVersion'] . "\n";
        echo "Current Database: " . $result['CurrentDatabase'] . "\n";
        echo "Current User: " . $result['CurrentUser'] . "\n\n";
    }
    
    // List tables
    echo "📋 Available Tables:\n";
    echo "----------------------------------------\n";
    $tables = $pdo->query("SHOW TABLES");
    
    $tableCount = 0;
    while ($table = $tables->fetch(PDO::FETCH_NUM)) {
        echo "- " . $table[0] . "\n";
        $tableCount++;
    }
    
    if ($tableCount == 0) {
        echo "No tables found in database.\n";
    } else {
        echo "\nTotal tables: $tableCount\n";
    }
    
    // Test some common tables from the web monitoring project
    echo "\n📋 Checking Web Monitoring Tables:\n";
    echo "----------------------------------------\n";
    
    $webMonTables = ['items', 'dataset2', 'gudang', 'site', 'transaksi1', 'users', 'login_logs'];
    
    foreach ($webMonTables as $tableName) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$tableName`");
            $count = $stmt->fetch();
            echo "✅ $tableName: " . number_format($count['count']) . " records\n";
        } catch (Exception $e) {
            echo "❌ $tableName: Table not found or error\n";
        }
    }
    
    $pdo = null; // Close connection
    
    echo "\n========================================\n";
    echo "✅ Database connection test completed!\n";
    echo "========================================\n";
    
} catch (PDOException $e) {
    echo "❌ Database Connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPossible solutions:\n";
    echo "1. Check if MySQL is running\n";
    echo "2. Verify host and port are correct\n";
    echo "3. Check username and password\n";
    echo "4. Ensure database 'web_mon' exists\n";
    echo "5. Check MySQL user permissions\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";
?>