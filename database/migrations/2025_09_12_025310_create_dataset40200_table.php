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
        Schema::create('dataset40200', function (Blueprint $table) {
            $table->id();
            $table->string('usage')->nullable();
            $table->string('nomor_dokumen')->nullable();
            $table->string('tanggal_dokumen')->nullable();
            $table->string('dasar')->nullable();
            $table->string('part_number')->nullable();
            $table->string('dari_gudang')->nullable();
            $table->string('ke_gudang')->nullable();
            $table->string('dipasang_di_no_reg_sista')->nullable();
            $table->string('status_permintaan')->nullable();
            $table->string('status_penerimaan')->nullable();
            $table->string('status_pengiriman')->nullable();
            $table->string('inbox_dokumen')->nullable();
            $table->string('jabatan')->nullable();
            $table->string('site')->nullable();
            $table->string('assignment_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dataset40200');
    }
};
