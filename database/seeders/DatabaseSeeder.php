<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            GudangSiteSeeder::class,
            Dataset2Seeder::class,
            Dataset2TambahanSeeder::class,
            Transaksi1Seeder::class,
            Transaksi2Seeder::class,
            Dataset40200Seeder::class,
        ]);
    }
}