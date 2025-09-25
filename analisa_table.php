<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ANALISA TABEL dataset2 ===\n";

$columns = DB::select('SHOW COLUMNS FROM dataset2');
echo "Jumlah kolom tabel: " . count($columns) . "\n";
echo "Struktur kolom:\n";
foreach($columns as $i => $col) {
    echo "  " . ($i+1) . ". '" . $col->Field . "' (" . $col->Type . ")\n";
}

$count = DB::table('dataset2')->count();
echo "\nJumlah record saat ini: " . $count . "\n";

// Sample data
echo "\nSample data (3 record pertama):\n";
$samples = DB::table('dataset2')->limit(3)->get();
foreach($samples as $i => $sample) {
    echo "Record " . ($i+1) . ":\n";
    echo "  Item ID: '" . $sample->{'Item ID'} . "'\n";
    echo "  Part Number: '" . $sample->{'Part Number'} . "'\n";
    echo "  Nama Barang: '" . $sample->{'Nama Barang'} . "'\n";
    echo "\n";
}
?>