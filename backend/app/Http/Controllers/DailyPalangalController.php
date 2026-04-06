<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DailyPalangalService;
use App\Services\AstrologyCalculationService;

class DailyPalangalController extends Controller
{
    private DailyPalangalService $palan;

    public function __construct(DailyPalangalService $palan)
    {
        $this->palan = $palan;
    }

    public function show($rasi_index)
    {
        $date = new \DateTime();
        $res = $this->palan->getDailyPalan((int) $rasi_index, $date);
        return response()->json($res);
    }

    public function nextFiveDays($rasi_index)
    {
        $res = $this->palan->getFiveDayExact((int) $rasi_index, 0, 0); // Temporary fallback
        return response()->json($res);
    }

    public function detailedAnalysis(Request $request)
    {
        $request->validate([
            'rasi' => 'required|integer',
            'nakshatra' => 'required|integer',
            'lagnam' => 'required|integer',
        ]);

        $res = $this->palan->getFiveDayExact(
            (int) $request->rasi,
            (int) $request->nakshatra,
            (int) $request->lagnam
        );
        return response()->json($res);
    }

    public function myDailyImpacts(Request $request)
    {
        $user = $request->user();
        if (!$user->dob || !$user->tob) {
            return response()->json(['message' => 'Birth data missing'], 400);
        }

        $dt = new \DateTime($user->dob . ' ' . $user->tob);
        $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
        $JD = app(AstrologyCalculationService::class)->getJulianDay(
            (int) $dt->format('Y'),
            (int) $dt->format('m'),
            (int) $dt->format('d'),
            $hr
        );

        $calc = app(AstrologyCalculationService::class);
        $moonLon = $calc->getMoonLongitude($JD);
        $rasi = (int) floor($moonLon / 30);
        $nakshatra = $calc->getNakshatra($moonLon)['index'];

        // Use user birth location if available in birth_charts
        $lat = 11.3410; // Default Erode
        $lon = 77.7172;
        $chart = \App\Models\BirthChart::where('user_id', $user->id)->first();
        if ($chart) {
            $lat = (float) $chart->latitude;
            $lon = (float) $chart->longitude;
        }

        $lagna = $calc->getLagna($JD, $lat, $lon)['index'];

        $res = $this->palan->getFiveDayExact($rasi, $nakshatra, $lagna);
        return response()->json($res);
    }
}
