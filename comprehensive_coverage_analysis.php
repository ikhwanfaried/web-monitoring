<?php
require_once 'vendor/autoload.php';
use Illuminate\Database\Capsule\Manager as DB;

$capsule = new DB;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'database' => 'web_mon',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "=== COMPREHENSIVE FALLBACK COVERAGE ANALYSIS ===\n\n";

// Test dengan sample yang lebih besar untuk analisis coverage
$start_time = microtime(true);

$query = DB::table('dataset40200')
    ->select([
        'dataset40200.id',
        'dataset40200.part_number',
        DB::raw('COALESCE(items.`Nama Barang`, dataset2.`Nama Barang`) as nama_barang'),
        DB::raw('items.`Nama Barang` as items_nama'),
        DB::raw('dataset2.`Nama Barang` as dataset2_nama'),
    ])
    ->leftJoin('items', function($join) {
        $join->on('dataset40200.part_number', '=', 'items.Part Number')
             ->whereRaw('items.id = (SELECT MIN(id) FROM items i2 WHERE i2.`Part Number` = dataset40200.part_number)');
    })
    ->leftJoin('dataset2', 'dataset40200.part_number', '=', 'dataset2.Part Number')
    ->limit(100)
    ->get();

$end_time = microtime(true);
$execution_time = ($end_time - $start_time) * 1000;

echo "Sample size: " . count($query) . " records\n";
echo "Query execution time: " . number_format($execution_time, 2) . " ms\n\n";

$stats = [
    'total_records' => count($query),
    'has_final_nama' => 0,
    'from_items_only' => 0,
    'from_dataset2_only' => 0,
    'both_available_same' => 0,
    'both_available_different' => 0,
    'no_data_anywhere' => 0
];

$coverage_examples = [
    'items_only' => [],
    'dataset2_only' => [],
    'both_different' => [],
    'no_data' => []
];

foreach($query as $row) {
    $has_items = !empty($row->items_nama);
    $has_dataset2 = !empty($row->dataset2_nama);
    $has_final = !empty($row->nama_barang);
    
    if($has_final) $stats['has_final_nama']++;
    
    if($has_items && !$has_dataset2) {
        $stats['from_items_only']++;
        if(count($coverage_examples['items_only']) < 3) {
            $coverage_examples['items_only'][] = "{$row->part_number} -> {$row->nama_barang}";
        }
    } elseif(!$has_items && $has_dataset2) {
        $stats['from_dataset2_only']++;
        if(count($coverage_examples['dataset2_only']) < 3) {
            $coverage_examples['dataset2_only'][] = "{$row->part_number} -> {$row->nama_barang}";
        }
    } elseif($has_items && $has_dataset2) {
        if($row->items_nama === $row->dataset2_nama) {
            $stats['both_available_same']++;
        } else {
            $stats['both_available_different']++;
            if(count($coverage_examples['both_different']) < 3) {
                $coverage_examples['both_different'][] = "{$row->part_number} -> Items: {$row->items_nama} | Dataset2: {$row->dataset2_nama}";
            }
        }
    } else {
        $stats['no_data_anywhere']++;
        if(count($coverage_examples['no_data']) < 3) {
            $coverage_examples['no_data'][] = $row->part_number;
        }
    }
}

echo "COVERAGE STATISTICS:\n";
echo str_repeat("=", 50) . "\n";
echo "Records with nama_barang: {$stats['has_final_nama']}/{$stats['total_records']} (" . 
     number_format(($stats['has_final_nama']/$stats['total_records'])*100, 1) . "%)\n\n";

echo "Data Sources Breakdown:\n";
echo "- Items table only: {$stats['from_items_only']} records\n";
echo "- Dataset2 table only (fallback): {$stats['from_dataset2_only']} records\n";
echo "- Both available (same data): {$stats['both_available_same']} records\n";
echo "- Both available (different data): {$stats['both_available_different']} records\n";
echo "- No data in either table: {$stats['no_data_anywhere']} records\n\n";

$fallback_benefit = $stats['from_dataset2_only'];
$total_with_data = $stats['has_final_nama'];
$total_from_items = $stats['from_items_only'] + $stats['both_available_same'] + $stats['both_available_different'];

echo "FALLBACK IMPACT:\n";
echo str_repeat("=", 50) . "\n";
echo "Records helped by fallback: {$fallback_benefit}\n";
echo "Coverage improvement: +" . number_format(($fallback_benefit/$stats['total_records'])*100, 1) . "%\n";
echo "Items table primary usage: {$total_from_items} records\n";
echo "Dataset2 fallback usage: {$fallback_benefit} records\n\n";

echo "EXAMPLES:\n";
echo str_repeat("=", 50) . "\n";

if(!empty($coverage_examples['items_only'])) {
    echo "Items table only:\n";
    foreach($coverage_examples['items_only'] as $example) {
        echo "  • {$example}\n";
    }
    echo "\n";
}

if(!empty($coverage_examples['dataset2_only'])) {
    echo "Dataset2 fallback (items table empty):\n";
    foreach($coverage_examples['dataset2_only'] as $example) {
        echo "  • {$example}\n";
    }
    echo "\n";
}

if(!empty($coverage_examples['both_different'])) {
    echo "Different data in both tables (items chosen):\n";
    foreach($coverage_examples['both_different'] as $example) {
        echo "  • {$example}\n";
    }
    echo "\n";
}

if(!empty($coverage_examples['no_data'])) {
    echo "No data in either table:\n";
    foreach($coverage_examples['no_data'] as $example) {
        echo "  • {$example}\n";
    }
    echo "\n";
}

if($fallback_benefit > 0) {
    echo "✅ CONCLUSION: Fallback strategy successfully improved coverage!\n";
    echo "   Without fallback: " . ($total_with_data - $fallback_benefit) . " records with nama_barang\n";
    echo "   With fallback: {$total_with_data} records with nama_barang\n";
    echo "   Improvement: +{$fallback_benefit} records (" . 
         number_format(($fallback_benefit/$stats['total_records'])*100, 1) . "% of total)\n";
} else {
    echo "ℹ️  No additional coverage gained from fallback in this sample.\n";
}