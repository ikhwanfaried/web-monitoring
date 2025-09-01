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
        Schema::create('transaksi1', function (Blueprint $table) {
            $table->id();
            $table->string('invusenum')->nullable();
            $table->string('bentuk')->nullable();
            $table->string('nomer_dokumen')->nullable();
            $table->string('tanggal_dokumen')->nullable();
            $table->text('description')->nullable();
            $table->string('gudang_asal')->nullable();
            $table->string('gudang_tujuan')->nullable();
            $table->string('status_transaksi')->nullable();
            $table->string('sudah_diterima')->nullable();
            $table->string('status_permintaan')->nullable();
            $table->string('site')->nullable();
            $table->string('assignment_status')->nullable();
            $table->string('name')->nullable();
            $table->string('jabatan')->nullable();
            $table->string('create_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi1');
    }
};
