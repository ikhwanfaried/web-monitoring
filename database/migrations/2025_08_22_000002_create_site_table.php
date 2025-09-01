<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('site', function (Blueprint $table) {
            $table->id();
            $table->string('Location')->nullable();
            $table->text('Description')->nullable();
            $table->string('Type')->nullable();
            $table->string('Status')->nullable();
            $table->string('Priority')->nullable();
            $table->string('Site')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site');
    }
};
