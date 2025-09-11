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
            Transaksi1Seeder::class,
            Transaksi2Seeder::class,
        ]);
    }
}