<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PalmReading extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'tamil_results' => 'array',
        'fate_line_present' => 'boolean',
        'detection_confidence' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
