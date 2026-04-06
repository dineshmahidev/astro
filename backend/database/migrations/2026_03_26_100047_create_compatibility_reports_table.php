<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compatibility_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('groom_chart_id');
            $table->unsignedBigInteger('bride_chart_id');
            $table->integer('total_score');
            $table->integer('max_score');
            $table->decimal('percentage', 5, 2);
            $table->json('portham_details');
            $table->text('marriage_prediction')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compatibility_reports');
    }
};
