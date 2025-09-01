<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('dataset2', function (Blueprint $table) {
            $table->string('Item ID')->primary();
            $table->string('Part Number')->nullable();
            $table->string('NSN')->nullable();
            $table->string('Nama Barang')->nullable();
            $table->string('PN Lama')->nullable();
            $table->string('Nama Lama')->nullable();
            $table->string('Gudang')->nullable();
            $table->string('Rak')->nullable();
            $table->string('Jumlah')->nullable();
            $table->string('Satuan')->nullable();
            $table->string('Harga Satuan')->nullable();
            $table->string('Komoditi')->nullable();
            $table->string('Komponen')->nullable();
            $table->string('Transaksi Terakhir')->nullable();
            $table->string('Lanud/Depo')->nullable();
            $table->string('Status')->nullable();
            $table->string('Keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dataset2');
    }
};
