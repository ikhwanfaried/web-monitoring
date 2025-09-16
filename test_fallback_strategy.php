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

echo "Testing fallback functionality: items -> dataset2...\n\n";

// Test the fallback query
$start_time = microtime(true);

$query = DB::table('dataset40200')
    ->select([
        'dataset40200.id',
        'dataset40200.nomor_dokumen',
        'transaksi1.bentuk',
        'dataset40200.part_number',
        DB::raw('COALESCE(items.`Nama Barang`, dataset2.`Nama Barang`) as nama_barang'),
        DB::raw('items.`Nama Barang` as items_nama'),
        DB::raw('dataset2.`Nama Barang` as dataset2_nama'),
        'dataset40200.dari_gudang',
        'dataset40200.ke_gudang'
    ])
    ->leftJoin('transaksi1', 'dataset40200.nomor_dokumen', '=', 'transaksi1.nomer_dokumen')
    ->leftJoin('items', function($join) {
        $join->on('dataset40200.part_number', '=', 'items.Part Number')
             ->whereRaw('items.id = (SELECT MIN(id) FROM items i2 WHERE i2.`Part Number` = dataset40200.part_number)');
    })
    ->leftJoin('dataset2', 'dataset40200.part_number', '=', 'dataset2.Part Number')
    ->limit(20)
    ->get();

$end_time = microtime(true);
$execution_time = ($end_time - $start_time) * 1000;

echo "Fallback query execution time: " . number_format($execution_time, 2) . " ms\n";
echo "Number of records retrieved: " . count($query) . "\n\n";

$items_count = 0;
$dataset2_count = 0;
$fallback_used = 0;
$total_nama_count = 0;

echo "Sample data showing fallback behavior:\n";
echo str_repeat("=", 80) . "\n";

foreach($query as $row) {
    if($row->nama_barang) $total_nama_count++;
    if($row->items_nama) $items_count++;
    if($row->dataset2_nama) $dataset2_count++;
    if(!$row->items_nama && $row->dataset2_nama) $fallback_used++;
    
    $source = '';
    if($row->items_nama && !$row->dataset2_nama) {
        $source = ' [FROM ITEMS]';
    } elseif(!$row->items_nama && $row->dataset2_nama) {
        $source = ' [FROM DATASET2 - FALLBACK]';
    } elseif($row->items_nama && $row->dataset2_nama) {
        $source = ' [FROM ITEMS - BOTH AVAILABLE]';
    } else {
        $source = ' [NO DATA IN EITHER TABLE]';
    }
    
    echo "ID: {$row->id} | Part: {$row->part_number}\n";
    echo "Final Nama: " . ($row->nama_barang ?? 'NULL') . $source . "\n";
    echo "Items: " . ($row->items_nama ?? 'NULL') . "\n";
    echo "Dataset2: " . ($row->dataset2_nama ?? 'NULL') . "\n";
    echo "Bentuk: " . ($row->bentuk ?? 'NULL') . "\n";
    echo str_repeat("-", 50) . "\n";
}

echo "\nFallback Statistics:\n";
echo "Records with items data: {$items_count}/20\n";
echo "Records with dataset2 data: {$dataset2_count}/20\n";
echo "Fallback used (dataset2 when items null): {$fallback_used}/20\n";
echo "Total records with nama_barang: {$total_nama_count}/20\n";

$coverage_improvement = $total_nama_count - $items_count;
echo "\nCoverage improvement from fallback: +{$coverage_improvement} records\n";

if($coverage_improvement > 0) {
    echo "✅ Fallback strategy successfully increased data coverage!\n";
} else {
    echo "ℹ️  No additional coverage from fallback in this sample.\n";
}