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

echo "Testing optimized query performance and fallback functionality...\n\n";

$start_time = microtime(true);

// Test the same optimized query structure as in the controller
$itemsSubquery = DB::table('items')
    ->select('Part Number', DB::raw('MIN(id) as min_id'))
    ->groupBy('Part Number');

$query = DB::table('dataset40200')
    ->select([
        'dataset40200.id',
        'dataset40200.nomor_dokumen',
        'transaksi1.bentuk',
        'dataset40200.part_number',
        DB::raw('COALESCE(items.`Nama Barang`, dataset2.`Nama Barang`) as nama_barang'),
        DB::raw('items.`Nama Barang` as items_nama'),
        DB::raw('dataset2.`Nama Barang` as dataset2_nama'),
    ])
    ->leftJoin('transaksi1', 'dataset40200.nomor_dokumen', '=', 'transaksi1.nomer_dokumen')
    ->leftJoinSub($itemsSubquery, 'items_min', function($join) {
        $join->on('dataset40200.part_number', '=', 'items_min.Part Number');
    })
    ->leftJoin('items', function($join) {
        $join->on('items_min.Part Number', '=', 'items.Part Number')
             ->on('items_min.min_id', '=', 'items.id');
    })
    ->leftJoin('dataset2', 'dataset40200.part_number', '=', 'dataset2.Part Number')
    ->limit(20)
    ->get();

$end_time = microtime(true);
$execution_time = ($end_time - $start_time) * 1000;

echo "Optimized query execution time: " . number_format($execution_time, 2) . " ms\n";
echo "Number of records retrieved: " . count($query) . "\n\n";

$stats = [
    'total' => count($query),
    'with_bentuk' => 0,
    'with_nama' => 0,
    'items_used' => 0,
    'dataset2_used' => 0,
    'fallback_cases' => 0
];

foreach($query as $row) {
    if($row->bentuk) $stats['with_bentuk']++;
    if($row->nama_barang) $stats['with_nama']++;
    if($row->items_nama) $stats['items_used']++;
    if($row->dataset2_nama) $stats['dataset2_used']++;
    if(!$row->items_nama && $row->dataset2_nama) $stats['fallback_cases']++;
}

echo "Performance and Data Integrity Check:\n";
echo str_repeat("=", 50) . "\n";
echo "Records with bentuk: {$stats['with_bentuk']}/{$stats['total']}\n";
echo "Records with nama_barang: {$stats['with_nama']}/{$stats['total']}\n";
echo "Items table hits: {$stats['items_used']}\n";
echo "Dataset2 table hits: {$stats['dataset2_used']}\n";
echo "Fallback cases (dataset2 when items null): {$stats['fallback_cases']}\n";

echo "\nSample data (first 5 records):\n";
echo str_repeat("=", 50) . "\n";
for($i = 0; $i < min(5, count($query)); $i++) {
    $row = $query[$i];
    $source = '';
    if($row->items_nama && !$row->dataset2_nama) {
        $source = ' [ITEMS ONLY]';
    } elseif(!$row->items_nama && $row->dataset2_nama) {
        $source = ' [DATASET2 FALLBACK]';
    } elseif($row->items_nama && $row->dataset2_nama) {
        $source = ' [ITEMS PRIORITY]';
    } else {
        $source = ' [NO DATA]';
    }
    
    echo "ID: {$row->id} | Part: {$row->part_number}\n";
    echo "Final: " . ($row->nama_barang ?? 'NULL') . $source . "\n";
    echo "Bentuk: " . ($row->bentuk ?? 'NULL') . "\n";
    echo "---\n";
}

if($execution_time < 5000) {
    echo "\n✅ PERFORMANCE: Excellent! Query under 5 seconds\n";
} elseif($execution_time < 30000) {
    echo "\n⚠️  PERFORMANCE: Acceptable, under 30 seconds\n";
} else {
    echo "\n❌ PERFORMANCE: Still too slow, over 30 seconds\n";
}

if($stats['fallback_cases'] > 0) {
    echo "✅ FALLBACK: Working correctly, {$stats['fallback_cases']} cases helped\n";
} else {
    echo "ℹ️  FALLBACK: No fallback cases in this sample\n";
}

if($stats['with_bentuk'] > 0) {
    echo "✅ BENTUK: Column working correctly\n";
} else {
    echo "⚠️  BENTUK: No bentuk data in this sample\n";
}