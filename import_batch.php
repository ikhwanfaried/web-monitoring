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

// Baca header dan bersihkan BOM
$header = fgetcsv($csv, 0, ';');
if (!empty($header[0]) && substr($header[0], 0, 3) === "\xef\xbb\xbf") {
    $header[0] = substr($header[0], 3);
}

echo "Headers berhasil dibaca: " . count($header) . " kolom\n";

$count = 0;
$skipped = 0;
$processed = 0;
$batchSize = 1000;
$batch = [];

$startTime = time();

while (($row = fgetcsv($csv, 0, ';')) !== false) {
    $processed++;
    
    // Skip baris kosong
    if (count(array_filter($row)) == 0) {
        $skipped++;
        continue;
    }
    
    // Skip baris dengan kolom tidak sesuai
    if (count($row) != count($header)) {
        $skipped++;
        continue;
    }
    
    $data = array_combine($header, $row);
    
    // Validasi Item ID
    if (!isset($data['Item ID']) || trim($data['Item ID']) === '') {
        $skipped++;
        continue;
    }
    
    // Bersihkan data
    $cleanData = [];
    foreach ($data as $key => $value) {
        $cleanValue = mb_convert_encoding($value ?? '', 'UTF-8', 'UTF-8');
        $cleanValue = preg_replace('/[^\x20-\x7E\x{00A0}-\x{017F}\x{0100}-\x{024F}]/u', '', $cleanValue);
        $cleanData[$key] = trim($cleanValue);
    }
    
    // Tambahkan ke batch
    $batch[] = [
        'Item ID' => $cleanData['Item ID'],
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
    ];
    
    // Batch insert ketika mencapai batchSize
    if (count($batch) >= $batchSize) {
        try {
            DB::table('dataset2')->insertOrIgnore($batch);
            $count += count($batch);
            
            $elapsed = time() - $startTime;
            $rate = $processed / max($elapsed, 1);
            echo "Progress: $count berhasil diimpor, $processed diproses, $skipped dilewati (rate: " . number_format($rate, 0) . " baris/detik)\n";
            
            $batch = [];
        } catch (Exception $e) {
            echo "Error batch insert: " . $e->getMessage() . "\n";
            $skipped += count($batch);
            $batch = [];
        }
    }
}

// Insert batch terakhir
if (!empty($batch)) {
    try {
        DB::table('dataset2')->insertOrIgnore($batch);
        $count += count($batch);
    } catch (Exception $e) {
        echo "Error final batch: " . $e->getMessage() . "\n";
        $skipped += count($batch);
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

$totalTime = time() - $startTime;
echo "Waktu total: {$totalTime} detik\n";
echo "Import selesai!\n";
?>