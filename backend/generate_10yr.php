<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

use App\Services\AstrologyCalculationService;
use App\Services\PredictionEngine;

$calc = new AstrologyCalculationService();
$pred = new PredictionEngine();

$dob = '2003-05-24';
$tob = '16:00:00';
$lat = 11.3410; // Erode
$lon = 77.7172;

$dt = new \DateTime($dob . ' ' . $tob);
$hr = (float) $dt->format('H') + ($dt->format('i') / 60) + ($dt->format('s') / 3600);

$JD = $calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
$moonLon = $calc->getMoonLongitude($JD);
$rasi = $calc->getRasi($moonLon);
$nakshatra = $calc->getNakshatra($moonLon);
$lagna = $calc->getLagna($JD, $lat, $lon);

$dashas = $pred->calculateVimshottariDasha($nakshatra, $dob . ' ' . $tob);

$now = new \DateTime('2026-04-01');
$tenYearsLater = (clone $now)->modify('+10 years');

$md = "# 10-Year Astrological Impact Report (2026-2036)\n\n";
$md .= "## Birth Information\n";
$md .= "| Detail | Value |\n";
$md .= "| :--- | :--- |\n";
$md .= "| **Rasi** | " . $rasi['name_tamil'] . " (" . $rasi['name_english'] . ") |\n";
$md .= "| **Nakshatra** | " . $nakshatra['name'] . " |\n";
$md .= "| **Padam** | " . $nakshatra['pada'] . " |\n";
$md .= "| **Lagnam** | " . $lagna['name_tamil'] . " (" . $lagna['name_english'] . ") |\n\n";

$md .= "## Next 10 Years Impact Timeline\n";
$md .= "| Period | Dasha / Bhukti | Impact / Rule |\n";
$md .= "| :--- | :--- | :--- |\n";

foreach ($dashas as $d) {
    foreach ($d['antardasha'] as $a) {
        $start = new \DateTime($a['start_date']);
        $end = new \DateTime($a['end_date']);
        
        // Show if period overlaps with the next 10 years
        if ($end >= $now && $start <= $tenYearsLater) {
            $status = "";
            if ($now >= $start && $now <= $end) {
                $status = "**[CURRENT]** ";
            }
            
            $md .= "| " . $status . $a['start_date'] . " to " . $a['end_date'] . " | " . $d['lord'] . " - " . $a['lord'] . " | " . $a['impact'] . " |\n";
        }
    }
}

file_put_contents('10_year_impact_2003.md', $md);
echo "10-year impact report generated: 10_year_impact_2003.md\n";
