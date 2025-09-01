<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Data Import Summary ===\n";
echo "Gudang records: " . DB::table('gudang')->count() . "\n";
echo "Site records: " . DB::table('site')->count() . "\n";
echo "Dataset2 records: " . DB::table('dataset2')->count() . "\n";
echo "Items records: " . DB::table('items')->count() . "\n";

echo "\n=== Sample Gudang Data ===\n";
$gudangSample = DB::table('gudang')->take(3)->get();
foreach ($gudangSample as $gudang) {
    echo "Location: {$gudang->Location}, Description: {$gudang->Description}, Site: {$gudang->Site}\n";
}

echo "\n=== Sample Site Data ===\n";
$siteSample = DB::table('site')->take(3)->get();
foreach ($siteSample as $site) {
    echo "Location: {$site->Location}, Description: {$site->Description}, Type: {$site->Type}\n";
}

echo "\n=== All Tables Summary ===\n";
echo "Total imported data across all tables: " . 
    (DB::table('gudang')->count() + 
     DB::table('site')->count() + 
     DB::table('dataset2')->count() + 
     DB::table('items')->count()) . " records\n";
