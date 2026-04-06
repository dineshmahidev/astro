<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PorthamCalculationService;
use App\Services\AstrologyCalculationService;

class CompatibilityController extends Controller
{
    private PorthamCalculationService $portham;
    private AstrologyCalculationService $calc;

    public function __construct(PorthamCalculationService $portham, AstrologyCalculationService $calc)
    {
        $this->portham = $portham;
        $this->calc = $calc;
    }

    public function match(Request $request)
    {
        $request->validate([
            'groom' => 'required|array',
            'bride' => 'required|array',
        ]);
        
        $groom = $request->groom;
        $bride = $request->bride;

        // Calculate Groom Nakshatra
        $groomExtra = [];
        if (isset($groom['dob']) && isset($groom['tob'])) {
            $dt = new \DateTime($groom['dob'] . ' ' . $groom['tob']);
            $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
            $JD = $this->calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
            $moonLonGroom = $this->calc->getMoonLongitude($JD);
            $nakData = $this->calc->getNakshatra($moonLonGroom);
            $groom['nakshatra_index'] = $nakData['index'];
            
            $groomExtra['nakshatra'] = $nakData['name'];
            $groomExtra['rasi'] = $this->calc->getRasi($moonLonGroom)['name_tamil'];
            $groomExtra['dob'] = $groom['dob'];
            $groomExtra['tob'] = $groom['tob'];
            $groomExtra['place'] = $groom['place'] ?? '';
        }

        // Calculate Bride Nakshatra
        $brideExtra = [];
        if (isset($bride['dob']) && isset($bride['tob'])) {
            $dt = new \DateTime($bride['dob'] . ' ' . $bride['tob']);
            $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
            $JD = $this->calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
            $moonLonBride = $this->calc->getMoonLongitude($JD);
            $nakData = $this->calc->getNakshatra($moonLonBride);
            $bride['nakshatra_index'] = $nakData['index'];
            
            $brideExtra['nakshatra'] = $nakData['name'];
            $brideExtra['rasi'] = $this->calc->getRasi($moonLonBride)['name_tamil'];
            $brideExtra['dob'] = $bride['dob'];
            $brideExtra['tob'] = $bride['tob'];
            $brideExtra['place'] = $bride['place'] ?? '';
        }
        
        $res = $this->portham->calculate10Portham($groom, $bride);
        $res['groom_details'] = $groomExtra;
        $res['bride_details'] = $brideExtra;

        return response()->json([
            'status' => 'success',
            'data' => $res
        ]);
    }

    public function dashboard(Request $request)
    {
        // Mock data for the marriage dashboard
        return response()->json([
            'status' => 'success',
            'data' => [
                'dailyMarriagePrediction' => "Venus is in a strong position today, making it an excellent time for harmony in relationships. Communication will flow effortlessly.",
                'doshaStatus' => [
                    'kujaDosha' => 'No Dosha',
                    'papasamyaMatch' => 'Highly Compatible',
                    'statusColor' => '#FFD700',
                    'remedyNeeded' => 'General devotional worship recommended to maintain positive energy.',
                    'sadeSati' => 'Not Active'
                ],
                'transitAnalysis' => [
                    ['planet' => 'Jupiter', 'house' => 5, 'effect' => 'Happiness and fulfillment in personal life'],
                    ['planet' => 'Venus', 'house' => 7, 'effect' => 'Strong bond and mutual understanding']
                ],
                'marriagePrediction' => [
                    'bestWindows' => [
                        ['year' => 2026, 'month' => 6, 'score' => 7, 'details' => ['Peak Auspicious Window']],
                        ['year' => 2026, 'month' => 9, 'score' => 6, 'details' => ['Very Favorable Alignment']]
                    ],
                    'dashaInfo' => [
                        'mahadasha' => 'Venus',
                        'antardasha' => 'Mercury'
                    ],
                    'marriageAnalysis' => [
                        'verdict' => 'Auspicious'
                    ]
                ],
                'upcomingMuhurthams' => [
                    ['date' => '2026-06-15', 'time' => '10:15 AM - 11:45 AM', 'label' => 'Subha Muhurtham', 'tith' => 'Sukla Paksha Dasami', 'rating' => 5],
                    ['date' => '2026-06-22', 'time' => '07:30 AM - 09:00 AM', 'label' => 'Subha Muhurtham', 'tith' => 'Sukla Paksha Ekadasi', 'rating' => 4]
                ]
            ]
        ]);
    }
}
