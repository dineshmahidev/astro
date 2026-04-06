<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $col) {
            $col->id();
            $col->foreignId('user_id')->constrained()->onDelete('cascade');
            $col->string('title');
            $col->text('description');
            $col->string('type')->default('system');
            $col->string('icon')->default('notifications');
            $col->string('color')->default('#D4AF37');
            $col->boolean('is_read')->default(false);
            $col->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
