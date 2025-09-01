<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VerifyDataSeeder extends Seeder
{
    public function run()
    {
        echo "=== VERIFIKASI DATA DATABASE WEB-MON ===\n\n";

        // Check items table
        $itemsCount = DB::table('items')->count();
        echo "📊 Tabel items: {$itemsCount} records\n";
        
        // Check dataset2 table
        $dataset2Count = DB::table('dataset2')->count();
        echo "📊 Tabel dataset2: {$dataset2Count} records\n";
        
        // Check gudang table
        $gudangCount = DB::table('gudang')->count();
        echo "📊 Tabel gudang: {$gudangCount} records\n";
        
        // Check site table
        $siteCount = DB::table('site')->count();
        echo "📊 Tabel site: {$siteCount} records\n";

        echo "\n=== SAMPLE DATA ===\n";
        
        // Sample from gudang - show all columns
        echo "\n🏢 Sample Gudang (1 record):\n";
        $sampleGudang = DB::table('gudang')->first();
        if ($sampleGudang) {
            echo json_encode($sampleGudang, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        }
        
        // Sample from site - show all columns  
        echo "\n🏛️ Sample Site (1 record):\n";
        $sampleSite = DB::table('site')->first();
        if ($sampleSite) {
            echo json_encode($sampleSite, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        }
        
        // Sample from dataset2 - show all columns
        echo "\n📋 Sample Dataset2 (1 record):\n";
        $sampleDataset2 = DB::table('dataset2')->first();
        if ($sampleDataset2) {
            echo json_encode($sampleDataset2, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        }

        echo "\n✅ Verifikasi selesai!\n";
    }
}
