<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Dataset2TambahanSeederNew extends Seeder
{
    public function run(): void
    {
        echo "Dataset2 Tambahan Seeder mulai\n";
        
        // Import CSV tambahan ke tabel dataset2
        $csvPath = base_path('data/dataset2_tambahan.csv');
        if (file_exists($csvPath)) {
            $csv = fopen($csvPath, 'r');
            $header = fgetcsv($csv, 0, ';');
            $count = 0;
            $skipped = 0;
            
            echo "Header CSV: " . implode(', ', $header) . "\n";
            echo "Total columns in header: " . count($header) . "\n";
            
            // Debug: tampilkan beberapa baris pertama untuk validasi
            $debugCount = 0;
            $position = ftell($csv);
            while (($debugRow = fgetcsv($csv, 0, ';')) !== false && $debugCount < 3) {
                echo "Debug row " . ($debugCount + 1) . " columns: " . count($debugRow) . " - Data: " . implode(', ', array_slice($debugRow, 0, 5)) . "...\n";
                $debugCount++;
            }
            fseek($csv, $position); // Reset file pointer
            
            while (($row = fgetcsv($csv, 0, ';')) !== false) {
                // Skip baris kosong
                if (count(array_filter($row)) == 0) {
                    $skipped++;
                    continue;
                }
                
                // Validasi jumlah kolom harus sama dengan header
                if (count($row) != count($header)) {
                    echo "Baris dilewati karena jumlah kolom tidak sesuai: " . count($row) . " vs " . count($header) . "\n";
                    $skipped++;
                    continue;
                }
                
                $data = array_combine($header, $row);
                
                // Validasi Item ID harus ada dan tidak kosong
                if (!$data || !isset($data['Item ID']) || trim($data['Item ID']) === '') {
                    echo "Baris dilewati karena Item ID kosong atau tidak ada. Data: " . json_encode(array_slice($data ?: [], 0, 3)) . "\n";
                    $skipped++;
                    continue;
                }
                
                // Bersihkan karakter khusus dari semua data
                $cleanData = [];
                foreach ($data as $key => $value) {
                    // Hapus karakter non-UTF8 dan trim whitespace
                    $cleanValue = mb_convert_encoding($value ?? '', 'UTF-8', 'UTF-8');
                    $cleanValue = preg_replace('/[^\x20-\x7E\x{00A0}-\x{017F}\x{0100}-\x{024F}]/u', '', $cleanValue);
                    $cleanData[$key] = trim($cleanValue);
                }
                
                try {
                    // Gunakan updateOrInsert untuk menghindari duplikat
                    DB::table('dataset2')->updateOrInsert(
                        ['Item ID' => $cleanData['Item ID']],
                        [
                            'Part Number' => $cleanData['Part Number'] ?? null,
                            'NSN' => $cleanData['NSN'] ?? null,
                            'Nama Barang' => $cleanData['Nama Barangg'] ?? $cleanData['Nama Barang'] ?? null, // Handle typo in header - prioritize 'Nama Barangg'
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
                    
                    if ($count % 100 == 0) {
                        echo "$count baris dataset2_tambahan diimpor...\n";
                    }
                } catch (\Exception $e) {
                    echo "Gagal insert/update Item ID: {$cleanData['Item ID']} - " . $e->getMessage() . "\n";
                    $skipped++;
                }
            }
            fclose($csv);
            echo "Dataset2 Tambahan Seeder selesai\n";
            echo "Total $count baris berhasil diimpor\n";
            echo "Total $skipped baris dilewati\n";
        } else {
            echo "File dataset2_tambahan.csv tidak ditemukan di: $csvPath\n";
        }
    }
}