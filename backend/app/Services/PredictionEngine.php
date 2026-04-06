<?php

namespace App\Services;

class PredictionEngine
{
    private array $dashaPeriods = [
        'கேது'     => 7,
        'சுக்கிரன்' => 20,
        'சூரியன்'   => 6,
        'சந்திரன்'  => 10,
        'செவ்வாய்'  => 7,
        'ராகு'     => 18,
        'குரு'     => 16,
        'சனி'      => 19,
        'புதன்'    => 17,
    ];

    private array $planetImpacts = [
        'கேது'      => 'ஆன்மீக நாட்டம், மன அமைதியின்மை, திடீர் மாற்றங்கள் ஏற்படும்.',
        'சுக்கிரன்' => 'சொகுசு வாழ்க்கை, திருமண யோகம், கலை ஆர்வம், செல்வம் சேரும்.',
        'சூரியன்'   => 'அதிகாரம், அரசு வழி அனுகூலம், தந்தை வழி ஆதரவு, கௌரவம் உயரும்.',
        'சந்திரன்'  => 'மன மகிழ்ச்சி, பயணங்கள், தாய் வழி உறவு மேன்மை, கலை ஞானம்.',
        'செவ்வாய்'  => 'நிலம் தொடர்பான லாபம், தைரியம், சகோதர வகையில் மனக்கசப்பு வரலாம்.',
        'ராகு'      => 'வெளிநாட்டு யோகம், எதிர்பாராத பணவரவு, பிரம்மாண்ட ஆசைகள், குழப்பங்கள்.',
        'குரு'      => 'கல்வி, புத்திர பாக்கியம், சுப காரியங்கள் நடக்கும், ஞானம் பெருகும்.',
        'சனி'       => 'கடின உழைப்பு, தாமத வெற்றி, நீண்ட கால பலன்கள், பொறுமை அவசியம்.',
        'புதன்'     => 'புத்திசாலித்தனம், வியாபார வெற்றி, பேச்சாற்றல், உறவினர்களுடன் இணக்கம்.',
    ];

    private array $nakshatraDashaLord = [
        0  => 'கேது',      // Ashwini
        1  => 'சுக்கிரன்', // Bharani
        2  => 'சூரியன்',   // Karthigai
        3  => 'சந்திரன்',  // Rohini
        4  => 'செவ்வாய்',  // Mrigaseersham
        5  => 'ராகு',      // Thiruvathirai
        6  => 'குரு',      // Punarpusam
        7  => 'சனி',       // Pusam
        8  => 'புதன்',     // Ayilyam
        9  => 'கேது',      // Magam
        10 => 'சுக்கிரன்', // Puram
        11 => 'சூரியன்',   // Uthiram
        12 => 'சந்திரன்',  // Hastham
        13 => 'செவ்வாய்',  // Chithirai
        14 => 'ராகு',      // Swathi
        15 => 'குரு',      // Visakam
        16 => 'சனி',       // Anusham
        17 => 'புதன்',     // Kettai
        18 => 'கேது',      // Mulam
        19 => 'சுக்கிரன்', // Puradam
        20 => 'சூரியன்',   // Uthiradam
        21 => 'சந்திரன்',  // Thiruvonam
        22 => 'செவ்வாய்',  // Avittam
        23 => 'ராகு',      // Sadhayam
        24 => 'குரு',      // Purattadhi
        25 => 'சனி',       // Uthirattadhi
        26 => 'புதன்',     // Revathi
    ];

    public function calculateVimshottariDasha(array $moonNakshatra, string $dob): array
    {
        $nakshatraSpan    = 360.0 / 27.0;
        $degInNakshatra   = $moonNakshatra['degree'];
        $remainingFraction= 1.0 - ($degInNakshatra / $nakshatraSpan);
        
        $startLord       = $this->nakshatraDashaLord[$moonNakshatra['index']];
        $startPeriodYears= $this->dashaPeriods[$startLord];
        $remainingYears  = $remainingFraction * $startPeriodYears;
        
        $dashaCycle = array_keys($this->dashaPeriods);
        $startIdx   = array_search($startLord, $dashaCycle);
        
        $dashas    = [];
        $birthDate = new \DateTime($dob);
        $current   = clone $birthDate;
        
        // Calculate the first partial dasha
        $remainingDays = floor($remainingYears * 365.2425);
        $endDate = (clone $birthDate)->modify('+' . $remainingDays . ' days');
        
        $dashas[] = [
            'lord'       => $startLord,
            'years'      => round($remainingYears, 2),
            'start_date' => $birthDate->format('Y-m-d'),
            'end_date'   => $endDate->format('Y-m-d'),
            'impact'     => $this->planetImpacts[$startLord],
            'antardasha' => $this->calculateAntardasha($startLord, $birthDate, $remainingYears),
        ];
        
        $current = $endDate;
        
        for ($i = 1; $i <= 9; $i++) {
            $lordIdx   = ($startIdx + $i) % 9;
            $lord      = $dashaCycle[$lordIdx];
            $periodYrs = (float) $this->dashaPeriods[$lord];
            
            $days = floor($periodYrs * 365.2425);
            $endDate = (clone $current)->modify('+' . $days . ' days');
            
            $dashas[] = [
                'lord'       => $lord,
                'years'      => $periodYrs,
                'start_date' => $current->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
                'impact'     => $this->planetImpacts[$lord],
                'antardasha' => $this->calculateAntardasha($lord, $current, $periodYrs),
            ];
            
            $current = $endDate;
        }
        
        return $dashas;
    }

    private function calculateAntardasha(string $mahadasha, \DateTime $start, float $totalYears): array
    {
        $dashaCycle = array_keys($this->dashaPeriods);
        $startIdx   = array_search($mahadasha, $dashaCycle);
        
        $antardashas = [];
        $current     = clone $start;
        
        for ($i = 0; $i < 9; $i++) {
            $lordIdx    = ($startIdx + $i) % 9;
            $lord       = $dashaCycle[$lordIdx];
            $antarYears = ($totalYears * $this->dashaPeriods[$lord]) / 120.0;
            
            $days = floor($antarYears * 365.2425);
            $endDate = (clone $current)->modify('+' . $days . ' days');
            
            $antardashas[] = [
                'lord'       => $lord,
                'start_date' => $current->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
                'impact'     => "{$mahadasha} - {$lord} : " . $this->planetImpacts[$lord],
            ];
            
            $current = $endDate;
        }
        
        return $antardashas;
    }

    public function detectYogas(array $chartData): array
    {
        $detectedYogas = [];
        $moonHouse = $this->findHouseWithGraha($chartData, 'சந்திரன்');
        $guruHouse = $this->findHouseWithGraha($chartData, 'குரு');
        
        if ($moonHouse && $guruHouse) {
            $diff = (($guruHouse - $moonHouse + 12) % 12);
            if (in_array($diff, [0, 3, 6, 9])) {
                $detectedYogas[] = [
                    'name'       => 'கஜகேசரி யோகம்',
                    'effect'     => 'புத்திசாலித்தனம், மரியாதை, செல்வாக்கு வாழ்வில் நீடிக்கும்',
                ];
            }
        }

        $sunHouse = $this->findHouseWithGraha($chartData, 'சூரியன்');
        $budhaHouse = $this->findHouseWithGraha($chartData, 'புதன்');
        if ($sunHouse && $budhaHouse && $sunHouse === $budhaHouse) {
            $detectedYogas[] = [
                'name'       => 'புதாதித்ய யோகம்',
                'effect'     => 'அறிவாற்றல் மிகும், கல்வியில் சிறப்பு, வணிகத்தில் வெற்றி',
            ];
        }

        return $detectedYogas;
    }

    private function findHouseWithGraha(array $chartData, string $graha): ?int
    {
        foreach ($chartData['houses'] as $houseNum => $houseData) {
            if (in_array($graha, $houseData['grahas'])) {
                return $houseNum;
            }
        }
        return null;
    }
}
