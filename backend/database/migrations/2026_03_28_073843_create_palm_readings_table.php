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
        Schema::create('palm_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('image_path')->nullable();
            $table->float('detection_confidence')->nullable();
            
            // Line Analysis
            $table->float('life_line_length')->nullable();
            $table->integer('life_line_depth')->nullable();
            $table->string('life_line_quality')->nullable();
            
            $table->float('head_line_length')->nullable();
            $table->string('head_line_type')->nullable();
            
            $table->float('heart_line_length')->nullable();
            $table->boolean('fate_line_present')->default(false);
            
            // Mount Analysis
            $table->integer('venus_mount_level')->nullable();
            $table->integer('moon_mount_level')->nullable();
            $table->integer('mercury_mount_level')->nullable();
            $table->integer('apollo_mount_level')->nullable();
            $table->integer('mars_mount_level')->nullable();
            $table->integer('jupiter_mount_level')->nullable();
            $table->integer('saturn_mount_level')->nullable();
            
            // Tamil Results
            $table->json('tamil_results')->nullable();
            
            $table->string('hand_type')->default('right');
            $table->string('gender')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('palm_readings');
    }
};
