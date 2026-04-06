<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('astro:today-palan {rasiIndex=0}', function (\App\Services\DailyPalangalService $palan) {
    $this->info("Fetching Today's Palan (இன்றைய ராசி பலன்)...");
    $date = new \DateTime();
    $res = $palan->getDailyPalan((int)$this->argument('rasiIndex'), $date);

    $this->table(['Detail', 'Value'], [
        ['Date', $res['date']],
        ['Day', $res['day_name']],
        ['Tara', $res['tara']],
        ['Category', $res['category']],
        ['Do (செய்ய)', $res['dos']],
        ['Dont (தவிர்க்க)', $res['donts']],
    ]);

    $this->newLine();
    $this->info("Palan:");
    $this->line($res['palan']);
})->purpose('Get today horoscope prediction for a specific rasi index (0-11)');
