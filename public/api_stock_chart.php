<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get parameters
    $filter = $_GET['filter'] ?? 'all';
    $detail = $_GET['detail'] ?? null; // habis, menipis, siap
    
    // Database connection
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=web_mon', 'root', '');
    
    // Base query
    $sql = "
        SELECT 
            `Part Number` as part_number, 
            `Nama Barang` as nama_barang, 
            jumlah, 
            Gudang as gudang 
        FROM dataset2 
        WHERE jumlah IS NOT NULL
    ";
    
    $params = [];
    
    // Apply filter if not 'all'
    if ($filter && $filter !== 'all') {
        $sql .= " AND Gudang = ?";
        $params[] = $filter;
    }
    
    // Apply detail filter for specific category
    if ($detail) {
        switch ($detail) {
            case 'habis':
                $sql .= " AND CAST(jumlah AS SIGNED) = 0";
                break;
            case 'menipis':
                $sql .= " AND CAST(jumlah AS SIGNED) > 0 AND CAST(jumlah AS SIGNED) <= 10";
                break;
            case 'siap':
                $sql .= " AND CAST(jumlah AS SIGNED) > 10";
                break;
        }
        
        // For detail request, return all items (remove limit untuk testing)
        $sql .= " ORDER BY `Part Number`"; // Hapus limit untuk sekarang
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug: log jumlah items yang ditemukan
        error_log("Detail request for '$detail': Found " . count($items) . " items");
        
        echo json_encode(['items' => $items]);
        exit;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $stockData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Categorize stock with detail items
    $stockHabis = [];
    $stockMenupis = [];
    $stockSiapPakai = [];
    
    foreach ($stockData as $item) {
        $jumlah = (int) $item['jumlah'];
        
        $itemDetail = [
            'part_number' => $item['part_number'],
            'nama_barang' => $item['nama_barang'],
            'jumlah' => $jumlah,
            'gudang' => $item['gudang']
        ];
        
        if ($jumlah == 0) {
            $stockHabis[] = $itemDetail;
        } elseif ($jumlah > 0 && $jumlah <= 10) {
            $stockMenupis[] = $itemDetail;
        } else {
            $stockSiapPakai[] = $itemDetail;
        }
    }
    
    // Prepare chart data
    $chartData = [
        [
            'name' => 'Stock Habis',
            'value' => count($stockHabis),
            'items' => array_slice($stockHabis, 0, 10) // Limit to 10 items for tooltip
        ],
        [
            'name' => 'Stock Menipis',
            'value' => count($stockMenupis),
            'items' => array_slice($stockMenupis, 0, 10)
        ],
        [
            'name' => 'Siap Pakai',
            'value' => count($stockSiapPakai),
            'items' => array_slice($stockSiapPakai, 0, 10)
        ]
    ];
    
    echo json_encode($chartData);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error fetching stock chart data',
        'message' => $e->getMessage()
    ]);
}
?>
