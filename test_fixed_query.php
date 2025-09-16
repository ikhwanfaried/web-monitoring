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

echo "Testing fixed query with optimized JOIN...\n\n";

// Test the fixed query
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
    ->leftJoin('transaksi1', 'dataset40200.nomor_dokumen', '=', 'transaksi1.nomer_dokumen')
    ->leftJoin('items', function($join) {
        $join->on('dataset40200.part_number', '=', 'items.Part Number')
             ->whereRaw('items.id = (SELECT MIN(id) FROM items i2 WHERE i2.`Part Number` = dataset40200.part_number)');
    })
    ->limit(10)
    ->get();

$end_time = microtime(true);
$execution_time = ($end_time - $start_time) * 1000;

echo "Fixed query execution time: " . number_format($execution_time, 2) . " ms\n";
echo "Number of records retrieved: " . count($query) . "\n\n";

$bentuk_count = 0;
$nama_count = 0;

echo "Sample data with fixed query:\n";
foreach($query as $row) {
    if($row->bentuk) $bentuk_count++;
    if($row->nama_barang) $nama_count++;
    
    echo "ID: {$row->id}\n";
    echo "Nomor Dokumen: {$row->nomor_dokumen}\n";
    echo "Bentuk: " . ($row->bentuk ?? 'NULL') . "\n";
    echo "Part Number: {$row->part_number}\n";
    echo "Nama Barang: " . ($row->nama_barang ?? 'NULL') . "\n";
    echo "Dari Gudang: {$row->dari_gudang}\n";
    echo "Ke Gudang: {$row->ke_gudang}\n";
    echo "---\n";
}

echo "Data completeness:\n";
echo "Records with bentuk: {$bentuk_count}/10\n";
echo "Records with nama_barang: {$nama_count}/10\n";

echo "\n✅ Fixed query should now retain the bentuk data!\n";