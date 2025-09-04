<?php
try {
    // Test database connection
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=web_mon', 'root', '');
    echo "Database connected successfully!\n";
    
    // Test query dataset2
    $result = $pdo->query("SELECT COUNT(*) as count FROM dataset2");
    $row = $result->fetch();
    echo "Dataset2 total records: " . $row['count'] . "\n";
    
    // Test stock chart data
    $result = $pdo->query("
        SELECT 
            `Part Number` as part_number, 
            `Nama Barang` as nama_barang, 
            jumlah, 
            Gudang as gudang 
        FROM dataset2 
        WHERE jumlah IS NOT NULL 
        LIMIT 5
    ");
    
    echo "\nSample stock data:\n";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $jumlah = (int) $row['jumlah'];
        $status = '';
        if ($jumlah == 0) {
            $status = 'HABIS';
        } elseif ($jumlah > 0 && $jumlah <= 10) {
            $status = 'MENIPIS';
        } else {
            $status = 'SIAP PAKAI';
        }
        
        echo "- " . $row['part_number'] . " | " . $row['nama_barang'] . " | Qty: " . $jumlah . " | Status: " . $status . "\n";
    }
    
    // Test categorization
    $result = $pdo->query("
        SELECT 
            SUM(CASE WHEN CAST(jumlah AS SIGNED) = 0 THEN 1 ELSE 0 END) as stock_habis,
            SUM(CASE WHEN CAST(jumlah AS SIGNED) > 0 AND CAST(jumlah AS SIGNED) <= 10 THEN 1 ELSE 0 END) as stock_menipis,
            SUM(CASE WHEN CAST(jumlah AS SIGNED) > 10 THEN 1 ELSE 0 END) as stock_siap_pakai
        FROM dataset2 
        WHERE jumlah IS NOT NULL
    ");
    
    $row = $result->fetch();
    echo "\nStock Summary:\n";
    echo "- Stock Habis: " . $row['stock_habis'] . "\n";
    echo "- Stock Menipis: " . $row['stock_menipis'] . "\n";
    echo "- Stock Siap Pakai: " . $row['stock_siap_pakai'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
