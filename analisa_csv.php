<?php
echo "=== ANALISA FILE CSV dataset2_tambahan.csv ===\n";

$csv = fopen('data/dataset2_tambahan.csv', 'r');
$header = fgetcsv($csv, 0, ';');

// Bersihkan BOM jika ada
if (!empty($header[0]) && substr($header[0], 0, 3) === "\xef\xbb\xbf") {
    $header[0] = substr($header[0], 3);
}

echo "Jumlah kolom header: " . count($header) . "\n";
echo "Header kolom:\n";
foreach($header as $i => $col) {
    echo "  " . ($i+1) . ". '" . $col . "'\n";
}

echo "\nSample data (5 baris pertama):\n";
for($i=0; $i<5; $i++) {
    $row = fgetcsv($csv, 0, ';');
    if(!$row) break;
    echo "Baris " . ($i+1) . " (" . count($row) . " kolom):\n";
    echo "  Item ID: '" . ($row[0] ?? 'KOSONG') . "'\n";
    echo "  Part Number: '" . ($row[1] ?? 'KOSONG') . "'\n";
    echo "  Nama Barang: '" . ($row[3] ?? 'KOSONG') . "'\n";
    echo "\n";
}

fclose($csv);
?>