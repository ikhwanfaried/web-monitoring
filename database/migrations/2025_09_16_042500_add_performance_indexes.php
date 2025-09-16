<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for better JOIN performance
        Schema::table('dataset40200', function (Blueprint $table) {
            // Index for joining with transaksi1
            $table->index('nomor_dokumen', 'idx_dataset40200_nomor_dokumen');
            // Index for joining with items and dataset2
            $table->index('part_number', 'idx_dataset40200_part_number');
        });

        Schema::table('transaksi1', function (Blueprint $table) {
            // Index for joining with dataset40200
            $table->index('nomer_dokumen', 'idx_transaksi1_nomer_dokumen');
        });

        Schema::table('items', function (Blueprint $table) {
            // Index for joining with dataset40200
            $table->index('Part Number', 'idx_items_part_number');
        });

        Schema::table('dataset2', function (Blueprint $table) {
            // Index for joining with dataset40200
            $table->index('Part Number', 'idx_dataset2_part_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dataset40200', function (Blueprint $table) {
            $table->dropIndex('idx_dataset40200_nomor_dokumen');
            $table->dropIndex('idx_dataset40200_part_number');
        });

        Schema::table('transaksi1', function (Blueprint $table) {
            $table->dropIndex('idx_transaksi1_nomer_dokumen');
        });

        Schema::table('items', function (Blueprint $table) {
            $table->dropIndex('idx_items_part_number');
        });

        Schema::table('dataset2', function (Blueprint $table) {
            $table->dropIndex('idx_dataset2_part_number');
        });
    }
};