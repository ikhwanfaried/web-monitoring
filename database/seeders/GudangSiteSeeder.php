<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class GudangSiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Import gudang.csv ke tabel gudang
        $csvPathGudang = base_path('data/gudang.csv');
        if (file_exists($csvPathGudang)) {
            echo "Mulai import gudang.csv\n";
            $csvGudang = fopen($csvPathGudang, 'r');
            $headerGudang = fgetcsv($csvGudang, 0, ';');
            
            // Clean header encoding dan hapus BOM
            $headerGudang = array_map(function($h) {
                $h = trim(mb_convert_encoding($h ?? '', 'UTF-8', 'UTF-8'));
                // Hapus BOM jika ada
                $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);
                return $h;
            }, $headerGudang);
            
            echo "Header gudang: " . implode(', ', $headerGudang) . "\n";
            $countGudang = 0;
            
            while (($row = fgetcsv($csvGudang, 0, ';')) !== false) {
                $data = array_combine($headerGudang, $row);
                
                // Debug beberapa baris pertama
                if ($countGudang < 3) {
                    echo "Data gudang baris " . ($countGudang + 1) . ":\n";
                    print_r($data);
                    echo "Location original: '{$data['Location']}'\n";
                }
                
                if (!$data) {
                    if ($countGudang < 5) echo "Gudang baris dilewati karena data tidak valid\n";
                    continue;
                }
                
                if (!isset($data['Location'])) {
                    if ($countGudang < 5) echo "Gudang baris dilewati karena tidak ada key Location\n";
                    continue;
                }
                
                if (trim($data['Location']) === '') {
                    if ($countGudang < 5) echo "Gudang baris dilewati karena Location kosong setelah trim\n";
                    continue;
                }
                
                $cleanData = [];
                foreach ($data as $key => $value) {
                    $cleanValue = mb_convert_encoding($value ?? '', 'UTF-8', 'UTF-8');
                    // Hapus regex yang terlalu agresif, hanya trim
                    $cleanData[$key] = trim($cleanValue);
                }
                
                // Debug cleaning result untuk beberapa baris pertama
                if ($countGudang < 3) {
                    echo "Location setelah cleaning: '{$cleanData['Location']}'\n";
                    echo "Length: " . strlen($cleanData['Location']) . "\n";
                }
                
                try {
                    \DB::table('gudang')->updateOrInsert(
                        ['Location' => $cleanData['Location']],
                        [
                            'Description' => $cleanData['Description'] ?? null,
                            'Type' => $cleanData['Type'] ?? null,
                            'Inventory Owner' => $cleanData['Inventory Owner'] ?? null,
                            'Name' => $cleanData['Name'] ?? null,
                            'Site' => $cleanData['Site'] ?? null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $countGudang++;
                } catch (\Exception $e) {
                    echo "Gagal insert gudang Location: {$cleanData['Location']} - " . $e->getMessage() . "\n";
                }
            }
            fclose($csvGudang);
            echo "Import gudang selesai, total $countGudang baris\n";
        }

        // Import site.csv ke tabel site
        $csvPathSite = base_path('data/site.csv');
        if (file_exists($csvPathSite)) {
            echo "Mulai import site.csv\n";
            $csvSite = fopen($csvPathSite, 'r');
            $headerSite = fgetcsv($csvSite, 0, ';');
            
            // Clean header encoding dan hapus BOM
            $headerSite = array_map(function($h) {
                $h = trim(mb_convert_encoding($h ?? '', 'UTF-8', 'UTF-8'));
                // Hapus BOM jika ada
                $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);
                return $h;
            }, $headerSite);
            
            echo "Header site: " . implode(', ', $headerSite) . "\n";
            echo "Header keys: " . print_r(array_values($headerSite), true) . "\n";
            $countSite = 0;
            
            while (($row = fgetcsv($csvSite, 0, ';')) !== false) {
                $data = array_combine($headerSite, $row);
                
                // Debug beberapa baris pertama
                if ($countSite < 3) {
                    echo "Data site baris " . ($countSite + 1) . ":\n";
                    print_r($data);
                }
                
                if (!$data) {
                    if ($countSite < 5) echo "Site baris dilewati karena data tidak valid\n";
                    continue;
                }
                
                if (!isset($data['Location'])) {
                    if ($countSite < 5) echo "Site baris dilewati karena tidak ada key Location\n";
                    continue;
                }
                
                if (trim($data['Location']) === '') {
                    if ($countSite < 5) echo "Site baris dilewati karena Location kosong setelah trim\n";
                    continue;
                }
                
                $cleanData = [];
                foreach ($data as $key => $value) {
                    $cleanValue = mb_convert_encoding($value ?? '', 'UTF-8', 'UTF-8');
                    // Hapus regex yang terlalu agresif, hanya trim
                    $cleanData[$key] = trim($cleanValue);
                }
                
                try {
                    \DB::table('site')->updateOrInsert(
                        ['Location' => $cleanData['Location']],
                        [
                            'Description' => $cleanData['Description'] ?? null,
                            'Type' => $cleanData['Type'] ?? null,
                            'Status' => $cleanData['Status'] ?? null,
                            'Priority' => $cleanData['Priority'] ?? null,
                            'Site' => $cleanData['Site'] ?? null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $countSite++;
                } catch (\Exception $e) {
                    echo "Gagal insert site Location: {$cleanData['Location']} - " . $e->getMessage() . "\n";
                }
            }
            fclose($csvSite);
            echo "Import site selesai, total $countSite baris\n";
        }
    }
}
