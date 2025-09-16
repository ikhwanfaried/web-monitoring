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

echo "Checking items table structure...\n\n";

// Check columns
$columns = DB::select('DESCRIBE items');
echo "Columns in items table:\n";
foreach($columns as $col) {
    echo "- {$col->Field} ({$col->Type})\n";
}

echo "\nSample data from items:\n";
$sample = DB::table('items')->limit(5)->get();
foreach($sample as $i => $row) {
    echo "\nRecord " . ($i + 1) . ":\n";
    foreach($row as $key => $value) {
        echo "  {$key}: {$value}\n";
    }
}

echo "\nTotal records in items table: " . DB::table('items')->count() . "\n";

// Check if there's a field that could match with part_number
echo "\nLooking for potential matching fields with part_number...\n";
$item_sample = DB::table('items')->first();
if($item_sample) {
    foreach($item_sample as $field => $value) {
        if(strpos(strtolower($field), 'part') !== false || 
           strpos(strtolower($field), 'code') !== false ||
           strpos(strtolower($field), 'number') !== false) {
            echo "Potential match field: {$field} = {$value}\n";
        }
    }
}