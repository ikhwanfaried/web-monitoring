<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Transaksi1;
use Illuminate\Support\Facades\DB;

class Transaksi1Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        Transaksi1::truncate();
        
        $csvFile = base_path('data/transaksi1.csv');
        
        if (!file_exists($csvFile)) {
            $this->command->error('CSV file not found: ' . $csvFile);
            return;
        }
        
        $this->command->info('Starting import of transaksi1.csv...');
        
        // Open and read CSV file
        $file = fopen($csvFile, 'r');
        
        // Skip header row
        $header = fgetcsv($file, 0, ';');
        
        $batchData = [];
        $batchSize = 1000;
        $totalProcessed = 0;
        
        while (($row = fgetcsv($file, 0, ';')) !== FALSE) {
            if (count($row) >= 15) {
                $batchData[] = [
                    'invusenum' => $row[0] ?? null,
                    'bentuk' => $row[1] ?? null,
                    'nomer_dokumen' => $row[2] ?? null,
                    'tanggal_dokumen' => $row[3] ?? null,
                    'description' => $row[4] ?? null,
                    'gudang_asal' => $row[5] ?? null,
                    'gudang_tujuan' => $row[6] ?? null,
                    'status_transaksi' => $row[7] ?? null,
                    'sudah_diterima' => $row[8] ?? null,
                    'status_permintaan' => $row[9] ?? null,
                    'site' => $row[10] ?? null,
                    'assignment_status' => $row[11] ?? null,
                    'name' => $row[12] ?? null,
                    'jabatan' => $row[13] ?? null,
                    'create_date' => $row[14] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                // Insert in batches for better performance
                if (count($batchData) >= $batchSize) {
                    DB::table('transaksi1')->insert($batchData);
                    $totalProcessed += count($batchData);
                    $this->command->info("Processed {$totalProcessed} records...");
                    $batchData = [];
                }
            }
        }
        
        // Insert remaining data
        if (!empty($batchData)) {
            DB::table('transaksi1')->insert($batchData);
            $totalProcessed += count($batchData);
        }
        
        fclose($file);
        
        $this->command->info("Import completed! Total records imported: {$totalProcessed}");
    }
}
