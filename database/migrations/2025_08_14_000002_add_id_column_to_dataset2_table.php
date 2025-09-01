<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('dataset2', function (Blueprint $table) {
            // Hapus primary key dari Item ID terlebih dahulu
            $table->dropPrimary(['Item ID']);
            
            // Tambah kolom id sebagai primary key auto increment di awal
            $table->id()->first();
            
            // Ubah Item ID menjadi kolom biasa (bukan primary key)
            $table->string('Item ID')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('dataset2', function (Blueprint $table) {
            // Hapus kolom id
            $table->dropColumn('id');
            
            // Kembalikan Item ID sebagai primary key
            $table->string('Item ID')->primary()->change();
        });
    }
};
