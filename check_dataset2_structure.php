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

echo "Checking dataset2 table structure...\n\n";

// Check columns in dataset2 table
$columns = DB::select("DESCRIBE dataset2");
echo "Dataset2 table columns:\n";
foreach($columns as $column) {
    echo "- {$column->Field} ({$column->Type})\n";
}

echo "\n";

// Sample data from dataset2
$sample = DB::table('dataset2')->limit(3)->get();
echo "Sample data from dataset2:\n";
foreach($sample as $row) {
    echo "Part Number: {$row->part_number}\n";
    // Look for columns that might contain nama_barang
    foreach((array)$row as $key => $value) {
        if(stripos($key, 'nama') !== false || stripos($key, 'barang') !== false || stripos($key, 'name') !== false) {
            echo "  {$key}: {$value}\n";
        }
    }
    echo "---\n";
}