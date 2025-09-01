<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('gudang', function (Blueprint $table) {
            $table->id();
            $table->string('Location')->nullable();
            $table->text('Description')->nullable();
            $table->string('Type')->nullable();
            $table->string('Inventory Owner')->nullable();
            $table->string('Name')->nullable();
            $table->string('Site')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gudang');
    }
};
