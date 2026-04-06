<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_palangals', function (Blueprint $table) {
            $table->id();
            $table->integer('rasi_index');
            $table->date('palan_date');
            $table->integer('moon_rasi')->nullable();
            $table->integer('moon_nakshatra')->nullable();
            $table->string('category');
            $table->text('palan_text');
            $table->integer('lucky_number')->nullable();
            $table->string('lucky_color')->nullable();
            $table->string('rahu_kalam')->nullable();
            $table->text('remedy')->nullable();
            $table->timestamps();
            
            $table->index(['rasi_index', 'palan_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_palangals');
    }
};
