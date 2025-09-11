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
        Schema::create('transaksi2', function (Blueprint $table) {
            $table->id();
            $table->string('usage', 20)->nullable();
            $table->string('nomor_dokumen', 50)->nullable();
            $table->string('tanggal_dokumen', 20)->nullable();
            $table->string('dasar', 100)->nullable();
            $table->string('part_number', 100)->nullable();
            $table->string('dari_gudang', 50)->nullable();
            $table->string('ke_gudang', 50)->nullable();
            $table->string('status_permintaan', 50)->nullable();
            $table->string('dipasang_di_no_reg_sista', 50)->nullable();
            $table->string('status_penerimaan', 50)->nullable();
            $table->string('status', 50)->nullable();
            $table->string('assignment_status', 50)->nullable();
            $table->string('assignee', 100)->nullable();
            $table->string('jabatan', 200)->nullable();
            $table->string('site', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi2');
    }
};
