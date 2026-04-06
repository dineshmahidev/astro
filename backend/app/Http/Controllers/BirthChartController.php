<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AstrologyCalculationService;
use App\Services\PredictionEngine;
use App\Models\BirthChart;

class BirthChartController extends Controller
{
    private AstrologyCalculationService $calc;
    private PredictionEngine $prediction;

    public function __construct(AstrologyCalculationService $calc, PredictionEngine $prediction)
    {
        $this->calc = $calc;
        $this->prediction = $prediction;
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'name'           => 'required|string',
            'date_of_birth'  => 'required|date',
            'time_of_birth'  => 'required|string',
            'latitude'       => 'required|numeric',
            'longitude'      => 'required|numeric',
            'place_name'     => 'string',
        ]);

        $dob = $request->date_of_birth;
        $tob = $request->time_of_birth;
        $lat = $request->latitude;
        $lon = $request->longitude;

        $dt = new \DateTime($dob . ' ' . $tob);
        $hr = (float) $dt->format('H') + ($dt->format('i') / 60) + ($dt->format('s') / 3600);
        
        $JD = $this->calc->getJulianDay(
            (int)$dt->format('Y'),
            (int)$dt->format('m'),
            (int)$dt->format('d'),
            $hr
        );

        $lagna     = $this->calc->getLagna($JD, $lat, $lon);
        $moonLon   = $this->calc->getMoonLongitude($JD);
        $moonRasi  = $this->calc->getRasi($moonLon);
        $nakshatra = $this->calc->getNakshatra($moonLon);
        
        $grahas = $this->calc->getAllGrahaPositions($JD);
        $houses = $this->calc->buildHouseChart($lagna['index'], $grahas);
        
        $dashas = $this->prediction->calculateVimshottariDasha($nakshatra, $dob . ' ' . $tob);
        $yogas  = $this->prediction->detectYogas(['houses' => $houses]);

        $result = [
            'input'     => $request->all(),
            'lagna'     => $lagna,
            'moon_rasi' => $moonRasi,
            'nakshatra' => $nakshatra,
            'graha_positions' => $grahas,
            'houses'    => $houses,
            'dashas'    => $dashas,
            'yogas'     => $yogas,
        ];

        return response()->json($result);
    }

    public function getDashaBhukti(Request $request)
    {
        $request->validate([
            'date_of_birth'  => 'required|date',
            'time_of_birth'  => 'required|string',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
        ]);

        $dob = $request->date_of_birth;
        $tob = $request->time_of_birth;
        $lat = $request->latitude ?? 11.0168; // Default Coimbatore
        $lon = $request->longitude ?? 76.9558; 

        $dt = new \DateTime($dob . ' ' . $tob);
        $hr = (float) $dt->format('H') + ($dt->format('i') / 60) + ($dt->format('s') / 3600);
        
        $JD = $this->calc->getJulianDay(
            (int)$dt->format('Y'),
            (int)$dt->format('m'),
            (int)$dt->format('d'),
            $hr
        );

        $moonLon   = $this->calc->getMoonLongitude($JD);
        $nakshatra = $this->calc->getNakshatra($moonLon);
        $lagna     = $this->calc->getLagna($JD, $lat, $lon);
        
        $dashas = $this->prediction->calculateVimshottariDasha($nakshatra, $dob . ' ' . $tob);

        $flatList = [];
        foreach ($dashas as $d) {
            foreach ($d['antardasha'] as $a) {
                $flatList[] = [
                    'dasha'      => $d['lord'],
                    'bhukti'     => $a['lord'],
                    'start_date' => $a['start_date'],
                    'end_date'   => $a['end_date'],
                    'impact'     => $a['impact'],
                    'display'    => "{$d['lord']} - {$a['lord']} : " . 
                                   (new \DateTime($a['start_date']))->format('d/m/Y') . " to " . 
                                   (new \DateTime($a['end_date']))->format('d/m/Y')
                ];
            }
        }

        return response()->json([
            'input'     => $request->all(),
            'nakshatra' => $nakshatra,
            'lagna'     => $lagna,
            'dashas'    => $dashas,
            'flat_list' => $flatList
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->calculate($request)->original;
        
        $chart = BirthChart::create([
            'user_id'         => null, 
            'name'            => $request->name,
            'date_of_birth'   => $request->date_of_birth,
            'time_of_birth'   => $request->time_of_birth,
            'place_of_birth'  => $request->place_name ?? 'Unknown',
            'latitude'        => $request->latitude,
            'longitude'       => $request->longitude,
            'lagna_rasi'      => $data['lagna']['index'],
            'moon_rasi'       => $data['moon_rasi']['index'],
            'nakshatra_index' => $data['nakshatra']['index'],
            'nakshatra_pada'  => $data['nakshatra']['pada'],
            'chart_data'      => $data,
        ]);

        return response()->json($chart);
    }

    public function transit(Request $request)
    {
        $now = new \DateTime();
        $hr = (float) $now->format('H') + ($now->format('i') / 60) + ($now->format('s') / 3600);
        $JD = $this->calc->getJulianDay((int)$now->format('Y'), (int)$now->format('m'), (int)$now->format('d'), $hr);
        $grahas = $this->calc->getAllGrahaPositions($JD);
        
        $transits = [];
        foreach($grahas as $name => $pos) {
            $rasi = $pos['rasi'];
            $transits[] = [
                'name' => $name,
                'lon' => $pos['longitude'],
                'rasi' => $rasi['name_english'],
                'rasi_ta' => $rasi['name_tamil']
            ];
        }

        return response()->json(['transits' => $transits]);
    }

    public function lucky(Request $request)
    {
        $user = $request->user();
        
        // Try to find rasi index from the string stored in profile
        $rasiNames = ['Mesha', 'Rishaba', 'Midhuna', 'Kadaga', 'Simma', 'Kanni', 'Thula', 'Viruchiga', 'Dhanusu', 'Magara', 'Kumbha', 'Meena'];
        $rasiIndex = 0;
        if ($user->rasi) {
            foreach($rasiNames as $idx => $name) {
                if (stripos($user->rasi, $name) !== false) {
                    $rasiIndex = $idx;
                    break;
                }
            }
        }

        $luckyColors = ['Red', 'White', 'Green', 'Yellow', 'Blue', 'Beige', 'Multicolor', 'Deep Red', 'Golden', 'Dark Blue', 'Steel Gray', 'Lemon'];
        $luckyNumbers = [9, 2, 5, 3, 6, 2, 7, 9, 3, 8, 8, 3];
        $luckyDays = ['Tuesday', 'Monday', 'Wednesday', 'Thursday', 'Friday', 'Monday', 'Friday', 'Tuesday', 'Thursday', 'Saturday', 'Saturday', 'Thursday'];

        return response()->json([
            'color' => $luckyColors[$rasiIndex % 12],
            'number' => $luckyNumbers[$rasiIndex % 12],
            'day' => $luckyDays[$rasiIndex % 12]
        ]);
    }
}
