<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=web_mon', 'root', '');
    echo "Connected to database web_mon\n";
    
    // Check if user table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'user'");
    if ($stmt->rowCount() > 0) {
        echo "Table 'user' exists\n";
        
        // Describe user table
        $stmt = $pdo->query('DESCRIBE user');
        echo "Table structure:\n";
        while($row = $stmt->fetch()) {
            echo $row['Field'] . ' - ' . $row['Type'] . "\n";
        }
    } else {
        echo "Table 'user' does not exist\n";
    }
    
} catch(Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
