<?php
$csv = fopen('data/dataset2_tambahan.csv', 'r');
$header = fgetcsv($csv, 0, ';');

echo "Analisis Header CSV:\n";
echo "Total kolom: " . count($header) . "\n\n";

foreach ($header as $i => $col) {
    echo ($i+1) . ". '" . $col . "' (length: " . strlen($col) . ")\n";
    // Tampilkan hex untuk melihat karakter tersembunyi
    echo "   Hex: " . bin2hex($col) . "\n";
}

echo "\nMembaca 3 baris data pertama:\n";
for ($i = 0; $i < 3; $i++) {
    $row = fgetcsv($csv, 0, ';');
    if ($row === false) break;
    
    echo "\nBaris " . ($i+1) . " (" . count($row) . " kolom):\n";
    echo "Item ID: '" . ($row[0] ?? 'KOSONG') . "'\n";
    echo "Part Number: '" . ($row[1] ?? 'KOSONG') . "'\n";
    echo "Nama Barang: '" . ($row[3] ?? 'KOSONG') . "'\n";
}

fclose($csv);
?>