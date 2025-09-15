<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PartLookup;
use Illuminate\Support\Facades\DB;

class PartLookupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate table terlebih dahulu
        DB::table('part_lookup')->truncate();
        
        $csvFile = database_path('../data/dataset2_cleaned.csv');
        
        if (!file_exists($csvFile)) {
            $this->command->error("File CSV tidak ditemukan: {$csvFile}");
            return;
        }
        
        $handle = fopen($csvFile, 'r');
        
        if ($handle !== FALSE) {
            // Skip header row
            $header = fgetcsv($handle, 1000, ';');
            $this->command->info("Header CSV: " . implode(', ', $header));
            
            $batchSize = 500;
            $batch = [];
            $rowCount = 0;
            $skippedCount = 0;
            
            while (($data = fgetcsv($handle, 1000, ';')) !== FALSE) {
                $rowCount++;
                
                // Pastikan ada minimal 5 kolom (Part Number di kolom ke-5)
                if (count($data) >= 5) {
                    $partNumber = trim($data[4]); // Part Number di kolom ke-5 (index 4)
                    $namaBarang = trim($data[5]); // Nama Barang di kolom ke-6 (index 5)
                    
                    // Skip jika part number atau nama barang kosong
                    if (empty($partNumber) || empty($namaBarang)) {
                        $skippedCount++;
                        continue;
                    }
                    
                    $batch[] = [
                        'part_number' => $partNumber,
                        'nama_barang' => $namaBarang,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                    
                    // Insert batch ketika mencapai batchSize
                    if (count($batch) >= $batchSize) {
                        try {
                            DB::table('part_lookup')->insert($batch);
                            $this->command->info("Inserted batch: " . ($rowCount - $skippedCount) . " rows processed");
                        } catch (\Exception $e) {
                            $this->command->error("Error inserting batch: " . $e->getMessage());
                        }
                        $batch = [];
                    }
                } else {
                    $skippedCount++;
                    $this->command->warn("Row {$rowCount} tidak memiliki cukup kolom, dilewati");
                }
            }
            
            // Insert sisa batch
            if (!empty($batch)) {
                try {
                    DB::table('part_lookup')->insert($batch);
                    $this->command->info("Inserted final batch");
                } catch (\Exception $e) {
                    $this->command->error("Error inserting final batch: " . $e->getMessage());
                }
            }
            
            fclose($handle);
            $this->command->info("Total {$rowCount} rows diproses, {$skippedCount} rows dilewati");
            
            // Tampilkan statistik
            $totalRecords = DB::table('part_lookup')->count();
            $this->command->info("Total records di database: {$totalRecords}");
        } else {
            $this->command->error("Tidak dapat membuka file CSV");
        }
    }
}
