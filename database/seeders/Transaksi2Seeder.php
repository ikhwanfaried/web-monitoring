<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaksi2;
use Illuminate\Support\Facades\DB;

class Transaksi2Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate table terlebih dahulu
        DB::table('transaksi2')->truncate();
        
        $csvFile = database_path('../data/transaksi2.csv');
        
        if (!file_exists($csvFile)) {
            $this->command->error("File CSV tidak ditemukan: {$csvFile}");
            return;
        }
        
        $handle = fopen($csvFile, 'r');
        
        if ($handle !== FALSE) {
            // Skip header row
            $header = fgetcsv($handle, 1000, ';');
            $this->command->info("Header CSV: " . implode(', ', $header));
            
            $batchSize = 100;
            $batch = [];
            $rowCount = 0;
            
            while (($data = fgetcsv($handle, 1000, ';')) !== FALSE) {
                $rowCount++;
                
                // Pastikan ada 15 kolom data
                if (count($data) >= 15) {
                    $batch[] = [
                        'usage' => $this->cleanData($data[0]),
                        'nomor_dokumen' => $this->cleanData($data[1]),
                        'tanggal_dokumen' => $this->cleanData($data[2]),
                        'dasar' => $this->cleanData($data[3]),
                        'part_number' => $this->cleanData($data[4]),
                        'dari_gudang' => $this->cleanData($data[5]),
                        'ke_gudang' => $this->cleanData($data[6]),
                        'status_permintaan' => $this->cleanData($data[7]),
                        'dipasang_di_no_reg_sista' => $this->cleanData($data[8]),
                        'status_penerimaan' => $this->cleanData($data[9]),
                        'status' => $this->cleanData($data[10]),
                        'assignment_status' => $this->cleanData($data[11]),
                        'assignee' => $this->cleanData($data[12]),
                        'jabatan' => $this->cleanData($data[13]),
                        'site' => $this->cleanData($data[14]),
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                    
                    // Insert batch ketika mencapai batchSize
                    if (count($batch) >= $batchSize) {
                        DB::table('transaksi2')->insert($batch);
                        $this->command->info("Inserted batch: " . $rowCount . " rows processed");
                        $batch = [];
                    }
                } else {
                    $this->command->warn("Row {$rowCount} tidak memiliki 15 kolom, dilewati");
                }
            }
            
            // Insert sisa batch
            if (!empty($batch)) {
                DB::table('transaksi2')->insert($batch);
                $this->command->info("Inserted final batch");
            }
            
            fclose($handle);
            $this->command->info("Total {$rowCount} rows diproses");
            
            // Tampilkan statistik
            $totalRecords = DB::table('transaksi2')->count();
            $this->command->info("Total records di database: {$totalRecords}");
        } else {
            $this->command->error("Tidak dapat membuka file CSV");
        }
    }
    
    private function cleanData($value)
    {
        // Bersihkan data dan konversi empty string ke null
        $cleaned = trim($value);
        return $cleaned === '' ? null : $cleaned;
    }
}
