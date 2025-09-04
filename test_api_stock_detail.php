<?php
echo "<h2>Test API Stock Chart Detail</h2>";

$tests = [
    ['category' => 'habis', 'name' => 'Stock Habis'],
    ['category' => 'menipis', 'name' => 'Stock Menipis'], 
    ['category' => 'siap', 'name' => 'Siap Pakai']
];

foreach ($tests as $test) {
    echo "<h3>Testing: {$test['name']}</h3>";
    
    $url = "http://127.0.0.1/web-monitoring/public/api_stock_chart.php?detail={$test['category']}";
    echo "<p>URL: <a href='$url' target='_blank'>$url</a></p>";
    
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    if ($data && isset($data['items'])) {
        echo "<p>✅ Berhasil - Found " . count($data['items']) . " items</p>";
        
        if (count($data['items']) > 0) {
            echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
            echo "<tr><th>Part Number</th><th>Nama Barang</th><th>Stock</th><th>Gudang</th></tr>";
            
            // Show first 5 items
            $limit = min(5, count($data['items']));
            for ($i = 0; $i < $limit; $i++) {
                $item = $data['items'][$i];
                echo "<tr>";
                echo "<td>" . htmlspecialchars($item['part_number']) . "</td>";
                echo "<td>" . htmlspecialchars($item['nama_barang']) . "</td>";
                echo "<td>" . $item['jumlah'] . "</td>";
                echo "<td>" . htmlspecialchars($item['gudang']) . "</td>";
                echo "</tr>";
            }
            
            if (count($data['items']) > 5) {
                echo "<tr><td colspan='4'>... dan " . (count($data['items']) - 5) . " items lainnya</td></tr>";
            }
            
            echo "</table>";
        }
    } else {
        echo "<p>❌ Error atau tidak ada data</p>";
        echo "<pre>" . htmlspecialchars($response) . "</pre>";
    }
    
    echo "<hr>";
}

echo "<h3>Testing: Chart Data Biasa</h3>";
$url = "http://127.0.0.1/web-monitoring/public/api_stock_chart.php";
echo "<p>URL: <a href='$url' target='_blank'>$url</a></p>";

$response = file_get_contents($url);
$data = json_decode($response, true);

if ($data && is_array($data)) {
    echo "<p>✅ Berhasil - Found " . count($data) . " categories</p>";
    
    foreach ($data as $category) {
        echo "<p><strong>{$category['name']}:</strong> {$category['value']} items</p>";
    }
} else {
    echo "<p>❌ Error</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
}
?>
