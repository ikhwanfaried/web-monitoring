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

echo "Comparing different query approaches to find the issue...\n\n";

// Test 1: Original JOIN approach for bentuk (that was working)
echo "1. Testing original JOIN approach for bentuk:\n";
$join_query = DB::table('dataset40200')
    ->select([
        'dataset40200.nomor_dokumen',
        'transaksi1.bentuk'
    ])
    ->leftJoin('transaksi1', 'dataset40200.nomor_dokumen', '=', 'transaksi1.nomer_dokumen')
    ->limit(5)
    ->get();

echo "Records with bentuk (JOIN method):\n";
foreach($join_query as $row) {
    echo "- {$row->nomor_dokumen} | Bentuk: " . ($row->bentuk ?? 'NULL') . "\n";
}

echo "\n2. Testing current subquery approach for bentuk:\n";
$subquery_bentuk = DB::table('dataset40200')
    ->select([
        'dataset40200.nomor_dokumen',
        DB::raw('(SELECT bentuk FROM transaksi1 WHERE transaksi1.nomer_dokumen = dataset40200.nomor_dokumen LIMIT 1) as bentuk')
    ])
    ->limit(5)
    ->get();

echo "Records with bentuk (Subquery method):\n";
foreach($subquery_bentuk as $row) {
    echo "- {$row->nomor_dokumen} | Bentuk: " . ($row->bentuk ?? 'NULL') . "\n";
}

echo "\n3. Checking data types and exact matches:\n";
$sample_docs = DB::table('dataset40200')->select('nomor_dokumen')->limit(3)->get();
foreach($sample_docs as $doc) {
    $match = DB::table('transaksi1')
        ->where('nomer_dokumen', $doc->nomor_dokumen)
        ->first();
    
    echo "Dataset40200: '{$doc->nomor_dokumen}'\n";
    if($match) {
        echo "Transaksi1 match: '{$match->nomer_dokumen}' | bentuk: {$match->bentuk}\n";
        echo "Exact match: " . ($doc->nomor_dokumen === $match->nomer_dokumen ? "YES" : "NO") . "\n";
    } else {
        echo "No match found in transaksi1\n";
    }
    echo "---\n";
}

echo "\n4. Testing items table comparison:\n";
$items_join = DB::table('dataset40200')
    ->select([
        'dataset40200.part_number',
        'items.Nama Barang'
    ])
    ->leftJoin('items', 'dataset40200.part_number', '=', 'items.Part Number')
    ->limit(5)
    ->get();

echo "Items JOIN results:\n";
foreach($items_join as $row) {
    echo "- {$row->part_number} | Nama: " . ($row->{'Nama Barang'} ?? 'NULL') . "\n";
}

$items_subquery = DB::table('dataset40200')
    ->select([
        'dataset40200.part_number',
        DB::raw('(SELECT `Nama Barang` FROM items WHERE items.`Part Number` = dataset40200.part_number LIMIT 1) as nama_barang')
    ])
    ->limit(5)
    ->get();

echo "\nItems Subquery results:\n";
foreach($items_subquery as $row) {
    echo "- {$row->part_number} | Nama: " . ($row->nama_barang ?? 'NULL') . "\n";
}