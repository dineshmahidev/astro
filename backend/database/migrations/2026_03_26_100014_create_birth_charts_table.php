<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('birth_charts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->date('date_of_birth');
            $table->time('time_of_birth');
            $table->string('place_of_birth');
            $table->decimal('latitude', 9, 6);
            $table->decimal('longitude', 9, 6);
            $table->integer('lagna_rasi')->nullable();
            $table->integer('moon_rasi')->nullable();
            $table->integer('sun_rasi')->nullable();
            $table->integer('nakshatra_index')->nullable();
            $table->integer('nakshatra_pada')->nullable();
            $table->json('chart_data')->nullable();
            $table->json('dasha_data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('birth_charts');
    }
};
