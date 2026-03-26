<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * IMPORTANT: This command is prepared for future use when SQL Server access is granted.
 * Currently DISABLED and will not run automatically.
 * 
 * To enable:
 * 1. Ensure SQL Server connection is accessible (DB_CONNECTION2 in .env)
 * 2. Uncomment scheduler in bootstrap/app.php
 * 3. Run Windows Task Scheduler with scheduler.bat
 * 
 * Manual execution: php artisan sync:sqlserver
 */
class SyncSqlServerData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:sqlserver';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '[DISABLED] Sync data from SQL Server to local database - Prepared for future use when SQL Server access is granted';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Check if SQL Server connection is configured and accessible
        if (!config('database.connections.sqlsrv')) {
            $this->error('❌ SQL Server connection not configured in database.php');
            $this->warn('⚠️  This command is prepared for future use.');
            return 1;
        }

        $this->info('🔄 Starting SQL Server data synchronization...');
        $this->warn('⚠️  NOTE: This feature is currently prepared for future use.');
        $this->warn('⚠️  Ensure SQL Server access is granted before enabling automatic sync.');
        
        try {
            // Test SQL Server connection first
            $this->info('🔌 Testing SQL Server connection...');
            DB::connection('sqlsrv')->getPdo();
            $this->info('✅ SQL Server connection successful!');
            
            // List of tables to sync
            $tablesToSync = [
                'inventory',
                'item',
                'location',
                'site',
                'invbalance',
                'invuse',
                'invuseline'
            ];
            
            foreach ($tablesToSync as $table) {
                $this->syncTable($table);
            }
            
            $this->info('✅ Synchronization completed successfully!');
            Log::info('SQL Server sync completed successfully');
            
        } catch (\Exception $e) {
            $this->error('❌ Synchronization failed: ' . $e->getMessage());
            Log::error('SQL Server sync failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Sync a specific table from SQL Server to local database
     */
    private function syncTable($tableName)
    {
        $this->info("Syncing table: {$tableName}");
        
        try {
            // Get data from SQL Server
            $sqlServerData = DB::connection('sqlsrv')->table($tableName)->get();
            
            if ($sqlServerData->isEmpty()) {
                $this->warn("  ⚠ Table {$tableName} is empty on SQL Server");
                return;
            }
            
            $this->info("  📥 Found {$sqlServerData->count()} records");
            
            // Clear local table before inserting
            DB::connection('sqlite')->table($tableName)->truncate();
            
            // Insert data in chunks to avoid memory issues
            $chunks = $sqlServerData->chunk(500);
            $totalInserted = 0;
            
            foreach ($chunks as $chunk) {
                $dataArray = $chunk->map(function($item) {
                    return (array) $item;
                })->toArray();
                
                DB::connection('sqlite')->table($tableName)->insert($dataArray);
                $totalInserted += count($dataArray);
                
                $this->info("  💾 Inserted {$totalInserted} records...");
            }
            
            $this->info("  ✅ Table {$tableName} synced successfully ({$totalInserted} records)");
            
        } catch (\Exception $e) {
            $this->error("  ❌ Failed to sync table {$tableName}: " . $e->getMessage());
            throw $e;
        }
    }
}
