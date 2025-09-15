<?php
/**
 * Script untuk membersihkan dataset2.csv
 * Menghapus duplikat Part Number dan menghasilkan file bersih
 */

// Set memory limit untuk file besar
ini_set('memory_limit', '512M');

// Path file
$inputFile = 'data/dataset2.csv';
$outputFile = 'data/dataset2_cleaned.csv';

echo "🧹 Starting data cleaning process...\n";
echo "📁 Input file: {$inputFile}\n";
echo "📁 Output file: {$outputFile}\n\n";

if (!file_exists($inputFile)) {
    die("❌ Error: Input file '{$inputFile}' not found!\n");
}

// Buka file input
$inputHandle = fopen($inputFile, 'r');
if (!$inputHandle) {
    die("❌ Error: Cannot open input file!\n");
}

// Array untuk menyimpan data unik
$uniqueData = [];
$duplicateCount = 0;
$totalRows = 0;
$emptyPartNumbers = 0;

// Baca header
$header = fgetcsv($inputHandle, 1000, ';');
if (!$header) {
    die("❌ Error: Cannot read header from input file!\n");
}

echo "📊 Header columns found:\n";
foreach ($header as $index => $column) {
    echo "   [{$index}] {$column}\n";
}

// Cari index kolom Part Number dan Nama Barang
$partNumberIndex = -1;
$namaBarangIndex = -1;

foreach ($header as $index => $column) {
    if (stripos($column, 'Part Number') !== false || $column === 'Part Number') {
        $partNumberIndex = $index;
    }
    if (stripos($column, 'Nama Barang') !== false || $column === 'Nama Barang') {
        $namaBarangIndex = $index;
    }
}

if ($partNumberIndex === -1) {
    die("❌ Error: 'Part Number' column not found!\n");
}

if ($namaBarangIndex === -1) {
    die("❌ Error: 'Nama Barang' column not found!\n");
}

echo "\n✅ Found required columns:\n";
echo "   Part Number at index: {$partNumberIndex}\n";
echo "   Nama Barang at index: {$namaBarangIndex}\n\n";

echo "🔄 Processing data...\n";

// Proses setiap baris
while (($data = fgetcsv($inputHandle, 1000, ';')) !== FALSE) {
    $totalRows++;
    
    // Progress indicator
    if ($totalRows % 1000 == 0) {
        echo "   Processed {$totalRows} rows...\n";
    }
    
    // Pastikan ada cukup kolom
    if (count($data) <= max($partNumberIndex, $namaBarangIndex)) {
        continue;
    }
    
    $partNumber = trim($data[$partNumberIndex]);
    $namaBarang = trim($data[$namaBarangIndex]);
    
    // Skip jika Part Number kosong
    if (empty($partNumber) || $partNumber === '' || $partNumber === ' ') {
        $emptyPartNumbers++;
        continue;
    }
    
    // Skip jika Nama Barang kosong
    if (empty($namaBarang) || $namaBarang === '' || $namaBarang === ' ') {
        continue;
    }
    
    // Cek duplikat
    if (isset($uniqueData[$partNumber])) {
        $duplicateCount++;
        
        // Prioritas: ambil nama barang yang lebih panjang/lebih informatif
        if (strlen($namaBarang) > strlen($uniqueData[$partNumber]['nama_barang'])) {
            $uniqueData[$partNumber] = [
                'part_number' => $partNumber,
                'nama_barang' => $namaBarang,
                'full_row' => $data
            ];
        }
    } else {
        // Data baru, simpan
        $uniqueData[$partNumber] = [
            'part_number' => $partNumber,
            'nama_barang' => $namaBarang,
            'full_row' => $data
        ];
    }
}

fclose($inputHandle);

echo "\n📈 Processing completed!\n";
echo "   Total rows processed: {$totalRows}\n";
echo "   Empty part numbers skipped: {$emptyPartNumbers}\n";
echo "   Duplicates found: {$duplicateCount}\n";
echo "   Unique part numbers: " . count($uniqueData) . "\n\n";

// Tulis file output
echo "💾 Writing cleaned data to output file...\n";

$outputHandle = fopen($outputFile, 'w');
if (!$outputHandle) {
    die("❌ Error: Cannot create output file!\n");
}

// Tulis header
fputcsv($outputHandle, $header, ';');

// Tulis data unik (sorted by part number)
ksort($uniqueData);
$writtenRows = 0;

foreach ($uniqueData as $partNumber => $item) {
    fputcsv($outputHandle, $item['full_row'], ';');
    $writtenRows++;
}

fclose($outputHandle);

echo "✅ Cleaning completed successfully!\n";
echo "📊 Final statistics:\n";
echo "   Input rows: {$totalRows}\n";
echo "   Output rows: {$writtenRows}\n";
echo "   Rows removed: " . ($totalRows - $writtenRows) . "\n";
echo "   Duplicate removal: " . round((($duplicateCount / $totalRows) * 100), 2) . "%\n";
echo "   File saved as: {$outputFile}\n\n";

// Tampilkan beberapa contoh data yang dibersihkan
echo "🔍 Sample of cleaned data (first 5 rows):\n";
$sampleHandle = fopen($outputFile, 'r');
$sampleHeader = fgetcsv($sampleHandle, 1000, ';');
$sampleCount = 0;

while (($sampleData = fgetcsv($sampleHandle, 1000, ';')) !== FALSE && $sampleCount < 5) {
    $sampleCount++;
    $partNum = $sampleData[$partNumberIndex];
    $namaBrg = $sampleData[$namaBarangIndex];
    echo "   [{$sampleCount}] Part: '{$partNum}' | Name: '{$namaBrg}'\n";
}

fclose($sampleHandle);

echo "\n🎉 Data cleaning process completed!\n";
echo "💡 Next steps:\n";
echo "   1. Review the cleaned file: {$outputFile}\n";
echo "   2. Import this cleaned data to database\n";
echo "   3. Update application queries to use cleaned data\n";
?>