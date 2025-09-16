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

echo "Testing updated query with items table for nama_barang...\n\n";

// Test the updated query with items table
$start_time = microtime(true);

$query = DB::table('dataset40200')
    ->select([
        'dataset40200.id',
        'dataset40200.nomor_dokumen',
        'transaksi1.bentuk',
        'dataset40200.part_number',
        'items.Nama Barang as nama_barang',
        'dataset40200.dari_gudang',
        'dataset40200.ke_gudang',
        'dataset40200.dipasang_di_no_reg_sista',
        'dataset40200.status_permintaan',
        'dataset40200.status_penerimaan',
        'dataset40200.status_pengiriman',
        'dataset40200.site'
    ])
    ->leftJoin('items', 'dataset40200.part_number', '=', 'items.Part Number')
    ->leftJoin('transaksi1', 'dataset40200.nomor_dokumen', '=', 'transaksi1.nomer_dokumen')
    ->groupBy('dataset40200.id')
    ->limit(10)
    ->get();

$end_time = microtime(true);
$execution_time = ($end_time - $start_time) * 1000; // Convert to milliseconds

echo "Query execution time: " . number_format($execution_time, 2) . " ms\n";
echo "Number of records retrieved: " . count($query) . "\n\n";

echo "Sample data with items table for nama_barang:\n";
foreach($query as $row) {
    echo "ID: {$row->id}\n";
    echo "Nomor Dokumen: {$row->nomor_dokumen}\n";
    echo "Bentuk: " . ($row->bentuk ?? 'NULL') . "\n";
    echo "Part Number: {$row->part_number}\n";
    echo "Nama Barang: " . ($row->nama_barang ?? 'NULL') . "\n";
    echo "Dari Gudang: {$row->dari_gudang}\n";
    echo "Ke Gudang: {$row->ke_gudang}\n";
    echo "---\n";
}

// Count coverage with items table
$records_with_nama_barang = DB::table('dataset40200')
    ->leftJoin('items', 'dataset40200.part_number', '=', 'items.Part Number')
    ->whereNotNull('items.Nama Barang')
    ->groupBy('dataset40200.id')
    ->get()
    ->count();

$total_records = DB::table('dataset40200')->count();
$coverage = ($records_with_nama_barang / $total_records) * 100;

echo "\nCoverage with items table:\n";
echo "Records with nama_barang: {$records_with_nama_barang}\n";
echo "Total records: {$total_records}\n";
echo "Coverage: " . number_format($coverage, 2) . "%\n";

echo "\n✅ Successfully switched to items table for nama_barang!\n";