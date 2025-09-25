<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Mulai import data dari dataset2_tambahan.csv...\n";

$csvPath = 'data/dataset2_tambahan.csv';
if (!file_exists($csvPath)) {
    echo "File tidak ditemukan: $csvPath\n";
    exit(1);
}

$csv = fopen($csvPath, 'r');
if (!$csv) {
    echo "Tidak bisa membuka file CSV\n";
    exit(1);
}

// Baca header
$header = fgetcsv($csv, 0, ';');

// Bersihkan BOM dari header pertama jika ada
if (!empty($header[0]) && substr($header[0], 0, 3) === "\xef\xbb\xbf") {
    $header[0] = substr($header[0], 3);
}

echo "Headers: " . implode(', ', $header) . "\n";
echo "Total kolom header: " . count($header) . "\n";

$count = 0;
$skipped = 0;
$processed = 0;

while (($row = fgetcsv($csv, 0, ';')) !== false) {
    $processed++;
    
    // Skip baris kosong
    if (count(array_filter($row)) == 0) {
        $skipped++;
        continue;
    }
    
    // Pastikan jumlah kolom sama dengan header
    if (count($row) != count($header)) {
        if ($processed <= 5 || $processed % 50000 == 0) { // Debug setiap 50k baris
            echo "Baris $processed: jumlah kolom tidak sesuai (" . count($row) . " vs " . count($header) . ") - SKIP\n";
        }
        $skipped++;
        continue;
    }
    
    $data = array_combine($header, $row);
    
    // Validasi Item ID
    if (!isset($data['Item ID']) || trim($data['Item ID']) === '') {
        $skipped++;
        continue;
    }
    
    // Skip jika Item ID kosong atau null
    if (trim($data['Item ID']) === '' || $data['Item ID'] === null) {
        if ($processed <= 5) {
            echo "Baris $processed: Item ID kosong - Data: " . substr(json_encode($data), 0, 100) . "...\n";
        }
        $skipped++;
        continue;
    }
    
    // Debug untuk 5 baris pertama yang valid
    if ($processed <= 5) {
        echo "Baris $processed: Item ID = '{$data['Item ID']}' - Valid\n";
    }
    
    // Bersihkan data
    $cleanData = [];
    foreach ($data as $key => $value) {
        $cleanValue = mb_convert_encoding($value ?? '', 'UTF-8', 'UTF-8');
        $cleanValue = preg_replace('/[^\x20-\x7E\x{00A0}-\x{017F}\x{0100}-\x{024F}]/u', '', $cleanValue);
        $cleanData[$key] = trim($cleanValue);
    }
    
    try {
        // Insert/Update ke database
        DB::table('dataset2')->updateOrInsert(
            ['Item ID' => $cleanData['Item ID']],
            [
                'Part Number' => $cleanData['Part Number'] ?? null,
                'NSN' => $cleanData['NSN'] ?? null,
                'Nama Barang' => $cleanData['Nama Barang'] ?? null,
                'PN Lama' => $cleanData['PN Lama'] ?? null,
                'Nama Lama' => $cleanData['Nama Lama'] ?? null,
                'Gudang' => $cleanData['Gudang'] ?? null,
                'Rak' => $cleanData['Rak'] ?? null,
                'Jumlah' => $cleanData['Jumlah'] ?? null,
                'Satuan' => $cleanData['Satuan'] ?? null,
                'Harga Satuan' => $cleanData['Harga Satuan'] ?? null,
                'Komoditi' => $cleanData['Komoditi'] ?? null,
                'Komponen' => $cleanData['Komponen'] ?? null,
                'Transaksi Terakhir' => $cleanData['Transaksi Terakhir'] ?? null,
                'Lanud/Depo' => $cleanData['Lanud/Depo'] ?? null,
                'Status' => $cleanData['Status'] ?? null,
                'Keterangan' => $cleanData['Keterangan'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
        $count++;
        
        if ($count % 5000 == 0) {
            echo "Progress: $count records berhasil diimpor... (Total diproses: $processed)\n";
        }
    } catch (Exception $e) {
        echo "Error pada Item ID {$cleanData['Item ID']}: " . $e->getMessage() . "\n";
        $skipped++;
    }
}

fclose($csv);

echo "\n=== HASIL IMPORT ===\n";
echo "Total baris diproses: $processed\n";
echo "Berhasil diimpor: $count\n";
echo "Dilewati: $skipped\n";

// Cek total records setelah import
$totalRecords = DB::table('dataset2')->count();
echo "Total records di database sekarang: $totalRecords\n";

echo "Import selesai!\n";
?>