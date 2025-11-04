<?php
// Direct test for stock API data count

require_once __DIR__ . '/vendor/autoload.php';

// Database connection
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=web_monitoring', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== TESTING STOCK API DATA COUNT ===\n\n";
    
    // Test 1: All data
    echo "TEST 1: ALL DATA (No Filter)\n";
    echo str_repeat("-", 50) . "\n";
    
    $sql1 = "
        SELECT COUNT(*) as total
        FROM inventory
        INNER JOIN item ON inventory.itemnum = item.itemnum
        INNER JOIN location ON inventory.idlocation = location.id
        LEFT JOIN invbalance ON inventory.itemnum = invbalance.itemnum 
            AND location.location = invbalance.location
    ";
    
    $stmt1 = $pdo->query($sql1);
    $result1 = $stmt1->fetch(PDO::FETCH_ASSOC);
    echo "Total rows: " . $result1['total'] . "\n\n";
    
    // Test 2: With site filter "LANUD ATS"
    echo "TEST 2: SITE FILTER = 'LANUD ATS'\n";
    echo str_repeat("-", 50) . "\n";
    
    $sql2 = "
        SELECT COUNT(*) as total
        FROM inventory
        INNER JOIN item ON inventory.itemnum = item.itemnum
        INNER JOIN location ON inventory.idlocation = location.id
        LEFT JOIN invbalance ON inventory.itemnum = invbalance.itemnum 
            AND location.location = invbalance.location
        WHERE location.idsite = (SELECT id FROM site WHERE siteid = 'LANUD ATS')
    ";
    
    $stmt2 = $pdo->query($sql2);
    $result2 = $stmt2->fetch(PDO::FETCH_ASSOC);
    echo "Total rows: " . $result2['total'] . "\n";
    echo "Expected: 39\n";
    
    if ($result2['total'] == 39) {
        echo "✅ MATCH!\n\n";
    } else {
        echo "❌ MISMATCH!\n\n";
    }
    
    // Test 3: Category breakdown for LANUD ATS
    echo "TEST 3: CATEGORY BREAKDOWN FOR 'LANUD ATS'\n";
    echo str_repeat("-", 50) . "\n";
    
    $sql3 = "
        SELECT 
            inventory.itemnum,
            COALESCE(invbalance.curbal, 0) as jumlah
        FROM inventory
        INNER JOIN item ON inventory.itemnum = item.itemnum
        INNER JOIN location ON inventory.idlocation = location.id
        LEFT JOIN invbalance ON inventory.itemnum = invbalance.itemnum 
            AND location.location = invbalance.location
        WHERE location.idsite = (SELECT id FROM site WHERE siteid = 'LANUD ATS')
    ";
    
    $stmt3 = $pdo->query($sql3);
    $rows = $stmt3->fetchAll(PDO::FETCH_ASSOC);
    
    $stockHabis = 0;
    $stockMenupis = 0;
    $stockSiap = 0;
    
    foreach ($rows as $row) {
        $jumlah = (int)$row['jumlah'];
        
        if ($jumlah == 0) {
            $stockHabis++;
        } elseif ($jumlah > 0 && $jumlah <= 10) {
            $stockMenupis++;
        } else {
            $stockSiap++;
        }
    }
    
    echo "Stock Habis (0): " . $stockHabis . "\n";
    echo "Stock Menipis (1-10): " . $stockMenupis . "\n";
    echo "Siap Pakai (>10): " . $stockSiap . "\n";
    echo "Total: " . ($stockHabis + $stockMenupis + $stockSiap) . "\n\n";
    
    // Test 4: Sample data
    echo "TEST 4: SAMPLE 5 ROWS WITH BALANCE\n";
    echo str_repeat("-", 50) . "\n";
    
    $sql4 = "
        SELECT 
            inventory.itemnum,
            item.pn,
            location.location,
            COALESCE(invbalance.curbal, 0) as jumlah
        FROM inventory
        INNER JOIN item ON inventory.itemnum = item.itemnum
        INNER JOIN location ON inventory.idlocation = location.id
        LEFT JOIN invbalance ON inventory.itemnum = invbalance.itemnum 
            AND location.location = invbalance.location
        WHERE location.idsite = (SELECT id FROM site WHERE siteid = 'LANUD ATS')
        LIMIT 5
    ";
    
    $stmt4 = $pdo->query($sql4);
    $samples = $stmt4->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($samples as $sample) {
        echo sprintf(
            "Item: %s | PN: %s | Loc: %s | Qty: %d\n",
            $sample['itemnum'],
            $sample['pn'],
            $sample['location'],
            $sample['jumlah']
        );
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
