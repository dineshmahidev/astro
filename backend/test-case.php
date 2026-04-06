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
$nakshatra = $calc->getNakshatra($moonLon);
$lagna = $calc->getLagna($JD, $lat, $lon);

$dashas = $pred->calculateVimshottariDasha($nakshatra, $dob . ' ' . $tob);

$now = new \DateTime('2026-04-01');

$md = "# Birth Chart Analysis: 24/05/2003\n\n";
$md .= "## Details\n";
$md .= "- **DOB:** $dob $tob\n";
$md .= "- **Location:** Erode, Tamil Nadu\n";
$md .= "- **Lagnam:** " . $lagna['name_tamil'] . " (" . $lagna['name_english'] . ")\n";
$md .= "- **Nakshatra:** " . $nakshatra['name'] . " (Pada " . $nakshatra['pada'] . ")\n\n";

$md .= "## Current Dasha & Bhukti (As of Today)\n";
$currentDasha = null;
$currentBhukti = null;

foreach ($dashas as $d) {
    if ($now >= new \DateTime($d['start_date']) && $now <= new \DateTime($d['end_date'])) {
        $currentDasha = $d;
        foreach ($d['antardasha'] as $a) {
            if ($now >= new \DateTime($a['start_date']) && $now <= new \DateTime($a['end_date'])) {
                $currentBhukti = $a;
                break;
            }
        }
        break;
    }
}

if ($currentDasha && $currentBhukti) {
    $md .= "### CURRENT: **" . $currentDasha['lord'] . " Dasha / " . $currentBhukti['lord'] . " Bhukti**\n";
    $md .= "- **Period:** " . $currentBhukti['start_date'] . " to " . $currentBhukti['end_date'] . "\n";
    $md .= "- **Impact:** " . $currentBhukti['impact'] . "\n\n";
}

$md .= "## Upcoming Dasha Periods (Next 5 Results)\n";
$md .= "| Dasha Lord | Start Date | End Date | Impact |\n";
$md .= "| :--- | :--- | :--- | :--- |\n";

$count = 0;
$foundCurrent = false;

foreach ($dashas as $d) {
    if (!$foundCurrent) {
        if ($now <= new \DateTime($d['end_date'])) $foundCurrent = true;
        else continue;
    }
    
    // If it's the current dasha, show upcoming bhuktis
    if ($now <= new \DateTime($d['end_date']) && $now >= new \DateTime($d['start_date'])) {
        foreach ($d['antardasha'] as $a) {
            if (new \DateTime($a['start_date']) > $now && $count < 5) {
                $md .= "| " . $d['lord'] . " / " . $a['lord'] . " | " . $a['start_date'] . " | " . $a['end_date'] . " | " . $a['impact'] . " |\n";
                $count++;
            }
        }
    } else if ($count < 5) {
        $md .= "| **" . $d['lord'] . " (Full)** | " . $d['start_date'] . " | " . $d['end_date'] . " | " . $d['impact'] . " |\n";
        $count++;
    }
}

file_put_contents('dasha_result_2003.md', $md);
echo "Markdown file generated: dasha_result_2003.md\n";
