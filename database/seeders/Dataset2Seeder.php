<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Dataset2Seeder extends Seeder
{
    public function run(): void
    {
        echo "Dataset2 Seeder mulai\n";
        
        // Import CSV ke tabel dataset2
        $csvPath = base_path('data/dataset2.csv');
        if (file_exists($csvPath)) {
            $csv = fopen($csvPath, 'r');
            $header = fgetcsv($csv, 0, ';');
            $count = 0;
            
            while (($row = fgetcsv($csv, 0, ';')) !== false) {
                $data = array_combine($header, $row);
                
                // Validasi Item ID harus ada dan tidak kosong
                if (!$data || !isset($data['Item ID']) || trim($data['Item ID']) === '') {
                    echo "Baris dilewati karena Item ID kosong\n";
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
                    
                    if ($count % 100 == 0) {
                        echo "$count baris dataset2 diimpor...\n";
                    }
                } catch (\Exception $e) {
                    echo "Gagal insert/update Item ID: {$cleanData['Item ID']} - " . $e->getMessage() . "\n";
                }
            }
            fclose($csv);
            echo "Dataset2 Seeder selesai, total $count baris diimpor\n";
        } else {
            echo "File dataset2.csv tidak ditemukan\n";
        }
    }
}
