<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BirthChart extends Model
{
    protected $guarded = [];

    protected $casts = [
        'chart_data' => 'array',
        'dasha_data' => 'array',
        'date_of_birth' => 'date',
    ];
}
