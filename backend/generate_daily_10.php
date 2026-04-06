<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

use App\Services\DailyPalangalService;

$service = app(DailyPalangalService::class);

$rasi = 10;      // Kumbam
$nakshatra = 24; // Poorattadhi
$lagnam = 1;     // Rishabam

$md = "# 10-Day Detailed Daily Prediction (Daily Palan)\n\n";
$md .= "## Birth Profile\n";
$md .= "- **Rasi:** கும்பம் (Kumbam)\n";
$md .= "- **Nakshatra:** பூரட்டாதி\n";
$md .= "- **Lagnam:** ரிஷபம் (Rishabam)\n\n";

$md .= "## 10-Day Detailed Analysis\n\n";
$md .= "| Date | Day | Tara (Star Strength) | Impact (Palan) | Dos (செய்ய வேண்டியவை) | Don'ts (தவிர்க்க வேண்டியவை) |\n";
$md .= "| :--- | :--- | :--- | :--- | :--- | :--- |\n";

for ($i = 0; $i < 10; $i++) {
    $date = (new \DateTime())->modify("+$i days");
    $res = $service->getExactDailyPalan($rasi, $nakshatra, $lagnam, $date);
    
    $status = ($i == 0) ? "**[TODAY]** " : "";
    $md .= "| " . $status . $res['date'] . " | " . $res['day_name'] . " | " . $res['tara'] . " | " . $res['palan'] . " | " . $res['dos'] . " | " . $res['donts'] . " |\n";
}

file_put_contents('daily_palan_10days_2003.md', $md);
echo "10-day daily palan file generated: daily_palan_10days_2003.md\n";
