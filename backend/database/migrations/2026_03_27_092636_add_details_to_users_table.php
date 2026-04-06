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
        Schema::table('users', function (Blueprint $table) {
            $table->string('gender')->nullable();
            $table->date('dob')->nullable();
            $table->time('tob')->nullable();
            $table->string('rasi')->nullable();
            $table->string('nakshatra')->nullable();
            $table->integer('padam')->nullable();
            $table->string('profession')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['gender', 'dob', 'tob', 'rasi', 'nakshatra', 'padam', 'profession']);
        });
    }
};
