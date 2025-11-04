<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display, just log
ini_set('log_errors', 1);

try {
    // Get parameters
    $filter = $_GET['filter'] ?? 'all';
    $detail = $_GET['detail'] ?? null; // habis, menipis, siap
    // Support both 'site' and 'site_filter' for backward compatibility
    $siteFilter = $_GET['site'] ?? $_GET['site_filter'] ?? null; // site.siteid string
    $userLocId = isset($_GET['user_locid']) ? (int)$_GET['user_locid'] : null; // Cast to integer
    $userRole = $_GET['user_role'] ?? null; // user, admin, or superadmin
    
    // Debug log
    error_log("Stock Chart - Params received: filter=$filter, detail=$detail, site=$siteFilter, user_locid=$userLocId, user_role=$userRole");
    
    // Database connection
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=web_monitoring', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Base query - sama persis dengan getGudang di DashboardController
    // Menggunakan inventory sebagai base table, dengan LEFT JOIN ke invbalance
    // GROUP BY inventory.id (PK) untuk mencegah duplicate rows dari LEFT JOIN
    $sql = "
        SELECT 
            inventory.itemnum,
            item.pn as part_number,
            item.description as nama_barang,
            COALESCE(MAX(invbalance.curbal), 0) as jumlah,
            location.location as gudang,
            inventory.binnum as rak,
            item.issueunit as satuan
        FROM inventory
        INNER JOIN item ON inventory.itemnum = item.itemnum
        INNER JOIN location ON inventory.idlocation = location.id
        LEFT JOIN invbalance ON inventory.itemnum = invbalance.itemnum 
            AND location.location = invbalance.location
    ";
    
    $sql .= " WHERE 1=1";
    
    $params = [];
    
    // Apply USER location filter first (highest priority)
    if ($userRole === 'user' && $userLocId) {
        $sql .= " AND inventory.idlocation = ?";
        $params[] = $userLocId;
        error_log("Stock Chart - USER filter applied: idlocation = $userLocId");
    }
    // Apply site filter if provided (filter by site.siteid string) - for Admin role
    elseif ($siteFilter) {
        $sql .= " AND location.idsite = (SELECT id FROM site WHERE siteid = ? LIMIT 1)";
        $params[] = $siteFilter;
        error_log("Stock Chart - SITE filter applied: siteid = $siteFilter");
    } else {
        error_log("Stock Chart - NO FILTER applied (SuperAdmin mode or missing params)");
    }
    
    // Apply filter if not 'all'
    if ($filter && $filter !== 'all') {
        $sql .= " AND location.location = ?";
        $params[] = $filter;
        error_log("Stock Chart - GUDANG filter applied: location = $filter");
    }
    
    // Apply detail filter for specific category
    if ($detail) {
        switch ($detail) {
            case 'habis':
                $sql .= " AND COALESCE(invbalance.curbal, 0) = 0";
                break;
            case 'menipis':
                $sql .= " AND COALESCE(invbalance.curbal, 0) > 0 AND COALESCE(invbalance.curbal, 0) <= 10";
                break;
            case 'siap':
                $sql .= " AND COALESCE(invbalance.curbal, 0) > 10";
                break;
        }
        
        $sql .= " GROUP BY inventory.id";
        $sql .= " ORDER BY item.pn";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug: log jumlah items yang ditemukan
        error_log("Detail request for '$detail': Found " . count($items) . " items");
        
        echo json_encode(['items' => $items]);
        exit;
    }
    
    $sql .= " GROUP BY inventory.id";
    $sql .= " ORDER BY item.pn";
    
    // Debug: Log the complete SQL query
    error_log("Stock Chart - SQL Query: " . $sql);
    error_log("Stock Chart - Params: " . json_encode($params));
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $stockData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: Log total items fetched from inventory
    error_log("Stock Chart - Total items fetched from inventory: " . count($stockData));
    error_log("Stock Chart - Filter: " . $filter . ", Site Filter: " . ($siteFilter ?? 'none'));
    
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
            'gudang' => $item['gudang'],
            'rak' => $item['rak']
        ];
        
        if ($jumlah == 0) {
            $stockHabis[] = $itemDetail;
        } elseif ($jumlah > 0 && $jumlah <= 10) {
            $stockMenupis[] = $itemDetail;
        } else {
            $stockSiapPakai[] = $itemDetail;
        }
    }
    
    // Debug: Log categorization results
    error_log("Stock Chart - Categories: Habis=" . count($stockHabis) . ", Menipis=" . count($stockMenupis) . ", Siap=" . count($stockSiapPakai));
    error_log("Stock Chart - Total categorized: " . (count($stockHabis) + count($stockMenupis) + count($stockSiapPakai)));
    
    // Prepare chart data with debug info
    $chartData = [
        [
            'name' => 'Stock Habis',
            'value' => count($stockHabis),
            'items' => array_slice($stockHabis, 0, 10), // Limit to 10 items for tooltip
            'debug_total' => count($stockHabis)
        ],
        [
            'name' => 'Stock Menipis',
            'value' => count($stockMenupis),
            'items' => array_slice($stockMenupis, 0, 10),
            'debug_total' => count($stockMenupis)
        ],
        [
            'name' => 'Siap Pakai',
            'value' => count($stockSiapPakai),
            'items' => array_slice($stockSiapPakai, 0, 10),
            'debug_total' => count($stockSiapPakai)
        ]
    ];
    
    // Add debug summary to response
    $response = [
        'data' => $chartData,
        'debug' => [
            'total_fetched' => count($stockData),
            'total_categorized' => count($stockHabis) + count($stockMenupis) + count($stockSiapPakai),
            'filter' => $filter,
            'site_filter' => $siteFilter,
            'categories' => [
                'habis' => count($stockHabis),
                'menipis' => count($stockMenupis),
                'siap' => count($stockSiapPakai)
            ]
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error fetching stock chart data',
        'message' => $e->getMessage()
    ]);
}
?>
