<?php

namespace App\Services;

class DailyPalangalService
{
    private AstrologyCalculationService $calc;

    public function __construct(AstrologyCalculationService $calc)
    {
        $this->calc = $calc;
    }

    private array $statusActions = [
        'excellent' => [
            'dos' => 'புதிய முயற்சிகள், முதலீடு, முக்கிய பேச்சுவார்த்தைகள்.',
            'donts' => 'சோம்பல், வாய்ப்புகளைத் தவிர்த்தல், எதிர்மறை எண்ணங்கள்.'
        ],
        'good' => [
            'dos' => 'குடும்பத்துடன் நேரம் செலவிடுதல், நிலுவையில் உள்ள வேலைகளை முடித்தல்.',
            'donts' => 'அளவுக்கு மீறிய நம்பிக்கை, மற்றவர் விஷயத்தில் தலையிடுதல்.'
        ],
        'moderate' => [
            'dos' => 'பொறுமை, தியானம், வழக்கமான பணிகளில் கவனம்.',
            'donts' => 'புதிய முதலீடு, அவசர முடிவுகள், நீண்ட தூரப் பயணம்.'
        ],
        'caution' => [
            'dos' => 'குலதெய்வ வழிபாடு, அமைதி, வாகனத்தில் நிதானமான வேகம்.',
            'donts' => 'விவாதம், புதிய ஒப்பந்தங்கள், கடன்கள் வாங்குதல் அல்லது கொடுத்தல்.'
        ],
    ];

    private array $taraDetails = [
        1 => ['name' => 'ஜென்மத் தாரை', 'status' => 'moderate', 'meaning' => 'உடல் ஆரோக்கியத்தில் கவனம் தேவை. புதிய பொறுப்பால் பணிச்சுமை கூடும்.'],
        2 => ['name' => 'சம்பத் தாரை', 'status' => 'excellent', 'meaning' => 'தன லாபம் உண்டாகும். தொட்டது துலங்கும், பொருளாதார முன்னேற்றம் ஏற்படும்.'],
        3 => ['name' => 'விபத் தாரை', 'status' => 'caution', 'meaning' => 'தடைகள் வரலாம். பயணங்களில் கவனம், பேச்சில் நிதானம் அவசியம்.'],
        4 => ['name' => 'க்ஷேமத் தாரை', 'status' => 'good', 'meaning' => 'நன்மை பயக்கும் நாள். குடும்பத்தில் மகிழ்ச்சi, சுப செய்தி கிட்டும்.'],
        5 => ['name' => 'பிரத்யக் தாரை', 'status' => 'caution', 'meaning' => 'எதிர்ப்புகள் வரலாம். மற்றவரிடம் விவாதம் செய்வதைத் தவிர்க்கவும்.'],
        6 => ['name' => 'சாதகத் தாரை', 'status' => 'excellent', 'meaning' => 'முயற்சிகள் யாவும் வெற்றியில் முடியும். உயர்ந்த பதவிகள் தேடிவரும்.'],
        7 => ['name' => 'வதைத் தாரை', 'status' => 'caution', 'meaning' => 'அபாய நாள். முக்கிய முடிவுகளைத் தவிர்க்கவும். விழிப்புணர்வு தேவை.'],
        8 => ['name' => 'மித்ரத் தாரை', 'status' => 'good', 'meaning' => 'நண்பர்களின் உதவி கிடைக்கும். மனமகிழ்ச்சியான சம்பவங்கள் நடக்கும்.'],
        9 => ['name' => 'பரம மித்ரத் தாரை', 'status' => 'excellent', 'meaning' => 'மிகவும் சிறப்பான நாள். பெரிய மனிதர்களின் ஆதரவு முழுமையாகக் கிடைக்கும்.'],
    ];

    public function getFiveDayExact(int $rasi, int $nakshatra, int $lagna): array
    {
        $results = [];
        for ($i = 0; $i < 10; $i++) {
            $date = (new \DateTime())->modify("+$i days");
            $results[] = $this->getExactDailyPalan($rasi, $nakshatra, $lagna, $date);
        }
        return $results;
    }

    private array $dailyTimes = [
        'Sunday' => ['rahu' => '04:30 PM - 06:00 PM', 'yama' => '12:00 PM - 01:30 PM', 'gulika' => '03:00 PM - 04:30 PM', 'soolam' => 'மேற்கு'],
        'Monday' => ['rahu' => '07:30 AM - 09:00 AM', 'yama' => '10:30 AM - 12:00 PM', 'gulika' => '01:30 PM - 03:00 PM', 'soolam' => 'கிழக்கு'],
        'Tuesday' => ['rahu' => '03:00 PM - 04:30 PM', 'yama' => '09:00 AM - 10:30 AM', 'gulika' => '12:00 PM - 01:30 PM', 'soolam' => 'வடக்கு'],
        'Wednesday' => ['rahu' => '12:00 PM - 01:30 PM', 'yama' => '07:30 AM - 09:00 AM', 'gulika' => '10:30 AM - 12:00 PM', 'soolam' => 'வடக்கு'],
        'Thursday' => ['rahu' => '01:30 PM - 03:00 PM', 'yama' => '06:00 AM - 07:30 AM', 'gulika' => '09:00 AM - 10:30 AM', 'soolam' => 'தெற்கு'],
        'Friday' => ['rahu' => '10:30 AM - 12:00 PM', 'yama' => '03:00 PM - 04:30 PM', 'gulika' => '07:30 AM - 09:00 AM', 'soolam' => 'மேற்கு'],
        'Saturday' => ['rahu' => '09:00 AM - 10:30 AM', 'yama' => '01:30 PM - 03:00 PM', 'gulika' => '06:00 AM - 07:30 AM', 'soolam' => 'கிழக்கு'],
    ];

    public function getExactDailyPalan(int $birthRasi, int $birthNak, int $birthLagna, \DateTime $date): array
    {
        $JD = $this->calc->getJulianDay(
            (int) $date->format('Y'),
            (int) $date->format('m'),
            (int) $date->format('d'),
            12.0
        );

        $moonLon = $this->calc->getMoonLongitude($JD);
        $moonRasi = (int) floor($moonLon / 30);
        $moonNak = $this->calc->getNakshatra($moonLon)['index'];

        // 1. Tara Balam (Daily Star compatibility)
        $taraIndex = (($moonNak - $birthNak + 27) % 9) + 1;
        $taraInfo = $this->taraDetails[$taraIndex];

        // 2. Gocharam Bhavam from Birth Rasi
        $rasiBhavam = (($moonRasi - $birthRasi + 12) % 12) + 1;

        // 3. Gocharam Bhavam from Lagnam
        $lagnaBhavam = (($moonRasi - $birthLagna + 12) % 12) + 1;

        $category = $taraInfo['status'];
        $palan = $taraInfo['meaning'] . " ";

        if ($rasiBhavam == 8) {
            $category = 'caution';
            $palan .= "மேலும் இன்று உங்களுக்கு சந்திராஷ்டமம் என்பதால் கூடுதல் கவனம் தேவை.";
        } elseif ($lagnaBhavam == 11 || $lagnaBhavam == 2 || $lagnaBhavam == 9) {
            if ($category != 'caution')
                $category = 'excellent';
            $palan .= "லக்னபடி சந்திரன் சுப ஸ்தானத்தில் இருப்பதால் கூடுதல் நன்மைகள் நடக்கும்.";
        }

        $times = $this->dailyTimes[$date->format('l')];

        return [
            'date' => $date->format('Y-m-d'),
            'day_name' => $date->format('l'),
            'tara' => $taraInfo['name'],
            'rasi_bhavam' => $rasiBhavam,
            'lagna_bhavam' => $lagnaBhavam,
            'category' => $category,
            'palan' => $palan,
            'dos' => $this->statusActions[$category]['dos'] ?? '',
            'donts' => $this->statusActions[$category]['donts'] ?? '',
            'rahu_kalam' => $times['rahu'],
            'yama_gandam' => $times['yama'],
            'gulika_kalam' => $times['gulika'],
            'soolam' => $times['soolam'],
        ];
    }

    public function getDailyPalan(int $rasi, \DateTime $date): array
    {
        return $this->getExactDailyPalan($rasi, 0, 0, $date);
    }
}
