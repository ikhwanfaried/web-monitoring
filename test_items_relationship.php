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

echo "Testing relationship between dataset40200 and items table...\n\n";

// Sample part numbers from dataset40200
echo "Sample part_number from dataset40200:\n";
$sample_dataset40200 = DB::table('dataset40200')
    ->select('part_number')
    ->whereNotNull('part_number')
    ->limit(5)
    ->get();

foreach($sample_dataset40200 as $row) {
    echo "- {$row->part_number}\n";
}

echo "\nSample Part Number from items:\n";
$sample_items = DB::table('items')
    ->select('Part Number', 'Nama Barang')
    ->whereNotNull('Part Number')
    ->limit(5)
    ->get();

foreach($sample_items as $row) {
    echo "- {$row->{'Part Number'}} (Nama: {$row->{'Nama Barang'}})\n";
}

echo "\nTesting JOIN to see if there are matches:\n";
$matches = DB::table('dataset40200')
    ->select(
        'dataset40200.part_number',
        'items.Nama Barang as nama_barang'
    )
    ->leftJoin('items', 'dataset40200.part_number', '=', 'items.Part Number')
    ->whereNotNull('items.Nama Barang')
    ->limit(10)
    ->get();

if(count($matches) > 0) {
    echo "✅ Found matches:\n";
    foreach($matches as $match) {
        echo "- Part: {$match->part_number} | Nama: {$match->nama_barang}\n";
    }
} else {
    echo "❌ No matches found between dataset40200.part_number and items.Part Number\n";
}

echo "\nChecking coverage:\n";
echo "Total records in dataset40200: " . DB::table('dataset40200')->count() . "\n";
echo "Total records in items: " . DB::table('items')->count() . "\n";
$potential_matches = DB::table('dataset40200')
    ->leftJoin('items', 'dataset40200.part_number', '=', 'items.Part Number')
    ->whereNotNull('items.Nama Barang')
    ->count();
echo "Potential matches: {$potential_matches}\n";

$coverage = ($potential_matches / DB::table('dataset40200')->count()) * 100;
echo "Coverage: " . number_format($coverage, 2) . "%\n";