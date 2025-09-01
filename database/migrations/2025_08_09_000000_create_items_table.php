<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->string('Id')->primary();
            $table->string('Item')->nullable();
            $table->string('Nama Barang')->nullable();
            $table->string('Part Number')->nullable();
            $table->string('NSN')->nullable();
            $table->string('Serial #')->nullable();
            $table->string('Lokasi')->nullable();
            $table->string('Bin')->nullable();
            $table->string('Jenis')->nullable();
            $table->string('Kondisi (S/US)')->nullable();
            $table->string('Asset Group')->nullable();
            $table->string('Status')->nullable();
            $table->string('Site')->nullable();
            $table->string('Moved')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
