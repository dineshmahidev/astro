<?php

namespace App\Services;

class AstrologyCalculationService
{
    private array $rasiNames = [
        0  => ['tamil' => 'மேஷம்',      'english' => 'Mesham',      'lord' => 'செவ்வாய்'],
        1  => ['tamil' => 'ரிஷபம்',      'english' => 'Rishabam',    'lord' => 'சுக்கிரன்'],
        2  => ['tamil' => 'மிதுனம்',      'english' => 'Midhunam',    'lord' => 'புதன்'],
        3  => ['tamil' => 'கடகம்',        'english' => 'Kadagam',     'lord' => 'சந்திரன்'],
        4  => ['tamil' => 'சிம்மம்',      'english' => 'Simmam',      'lord' => 'சூரியன்'],
        5  => ['tamil' => 'கன்னி',        'english' => 'Kanni',       'lord' => 'புதன்'],
        6  => ['tamil' => 'துலாம்',       'english' => 'Thulam',      'lord' => 'சுக்கிரன்'],
        7  => ['tamil' => 'விருச்சிகம்',   'english' => 'Viruchigam',  'lord' => 'செவ்வாய்'],
        8  => ['tamil' => 'தனுசு',        'english' => 'Dhanusu',     'lord' => 'குரு'],
        9  => ['tamil' => 'மகரம்',        'english' => 'Magaram',     'lord' => 'சனி'],
        10 => ['tamil' => 'கும்பம்',      'english' => 'Kumbam',      'lord' => 'சனி'],
        11 => ['tamil' => 'மீனம்',        'english' => 'Meenam',      'lord' => 'குரு'],
    ];

    private array $nakshatras = [
        0  => ['name' => 'அஸ்வினி',      'lord' => 'கேது',    'devata' => 'அஸ்வினி குமாரர்கள்'],
        1  => ['name' => 'பரணி',         'lord' => 'சுக்கிரன்','devata' => 'யமன்'],
        2  => ['name' => 'கார்த்திகை',   'lord' => 'சூரியன்', 'devata' => 'அக்னி'],
        3  => ['name' => 'ரோஹிணி',       'lord' => 'சந்திரன்','devata' => 'பிரம்மா'],
        4  => ['name' => 'மிருகசீரிஷம்', 'lord' => 'செவ்வாய்','devata' => 'சோம'],
        5  => ['name' => 'திருவாதிரை',   'lord' => 'ராகு',    'devata' => 'ருத்ரன்'],
        6  => ['name' => 'புனர்பூசம்',   'lord' => 'குரு',    'devata' => 'அதிதி'],
        7  => ['name' => 'பூசம்',         'lord' => 'சனி',     'devata' => 'பிரகஸ்பதி'],
        8  => ['name' => 'ஆயிலியம்',     'lord' => 'புதன்',   'devata' => 'சர்ப்பம்'],
        9  => ['name' => 'மகம்',          'lord' => 'கேது',    'devata' => 'பித்ருக்கள்'],
        10 => ['name' => 'பூரம்',         'lord' => 'சுக்கிரன்','devata' => 'பகவன்'],
        11 => ['name' => 'உத்திரம்',     'lord' => 'சூரியன்', 'devata' => 'பகவன்'],
        12 => ['name' => 'ஹஸ்தம்',       'lord' => 'சந்திரன்','devata' => 'சாவித்ரி'],
        13 => ['name' => 'சித்திரை',     'lord' => 'செவ்வாய்','devata' => 'விஸ்வகர்மா'],
        14 => ['name' => 'சுவாதி',       'lord' => 'ராகு',    'devata' => 'வாயு'],
        15 => ['name' => 'விசாகம்',      'lord' => 'குரு',    'devata' => 'இந்திராக்னி'],
        16 => ['name' => 'அனுஷம்',       'lord' => 'சனி',     'devata' => 'மித்ரன்'],
        17 => ['name' => 'கேட்டை',       'lord' => 'புதன்',   'devata' => 'இந்திரன்'],
        18 => ['name' => 'மூலம்',         'lord' => 'கேது',    'devata' => 'நிர்ருதி'],
        19 => ['name' => 'பூராடம்',      'lord' => 'சுக்கிரன்','devata' => 'ஆபஸ்'],
        20 => ['name' => 'உத்திராடம்',   'lord' => 'சூரியன்', 'devata' => 'விஸ்வதேவர்'],
        21 => ['name' => 'திருவோணம்',    'lord' => 'சந்திரன்','devata' => 'விஷ்ணு'],
        22 => ['name' => 'அவிட்டம்',     'lord' => 'செவ்வாய்','devata' => 'வசுக்கள்'],
        23 => ['name' => 'சதயம்',        'lord' => 'ராகு',    'devata' => 'வருணன்'],
        24 => ['name' => 'பூரட்டாதி',    'lord' => 'குரு',    'devata' => 'அஜேகபாத்'],
        25 => ['name' => 'உத்திரட்டாதி', 'lord' => 'சனி',     'devata' => 'அஹிர்புத்னியன்'],
        26 => ['name' => 'ரேவதி',        'lord' => 'புதன்',   'devata' => 'பூஷா'],
    ];

    private array $houseNames = [
        1  => 'லக்னம் (தனு)',
        2  => 'தன பாவம்',
        3  => 'சகோதர பாவம்',
        4  => 'மாது பாவம்',
        5  => 'புத்ர பாவம்',
        6  => 'ரோக பாவம்',
        7  => 'களத்ர பாவம்',
        8  => 'மிருத்யு பாவம்',
        9  => 'பாக்கிய பாவம்',
        10 => 'கர்ம பாவம்',
        11 => 'லாப பாவம்',
        12 => 'வ்யய பாவம்',
    ];

    public function getJulianDay(int $year, int $month, int $day, float $hour): float
    {
        $ut = $hour - 5.5; 
        
        if ($month <= 2) {
            $year -= 1;
            $month += 12;
        }
        
        $A = floor($year / 100);
        $B = 2 - $A + floor($A / 4);
        
        $JD = floor(365.25 * ($year + 4716))
            + floor(30.6001 * ($month + 1))
            + $day + $ut / 24.0 + $B - 1524.5;
        
        return $JD;
    }

    public function getLahiriAyanamsa(float $JD): float
    {
        $T = ($JD - 2415020.0) / 36524.2; 
        $ayanamsa = 22.460148 + 1.396042 * $T + 0.000308 * $T * $T;
        return $ayanamsa;
    }

    public function getSunLongitude(float $JD): float
    {
        $T = ($JD - 2451545.0) / 36525.0; 
        $L0 = 280.46646 + 36000.76983 * $T + 0.0003032 * $T * $T;
        $L0 = fmod($L0, 360);
        $M = 357.52911 + 35999.05029 * $T - 0.0001537 * $T * $T;
        $M = deg2rad(fmod($M, 360));
        $C = (1.914602 - 0.004817 * $T - 0.000014 * $T * $T) * sin($M)
           + (0.019993 - 0.000101 * $T) * sin(2 * $M)
           + 0.000289 * sin(3 * $M);
        $sunLon = $L0 + $C; 
        $ayanamsa = $this->getLahiriAyanamsa($JD);
        $siderealLon = fmod($sunLon - $ayanamsa + 360, 360);
        return $siderealLon;
    }

    public function getMoonLongitude(float $JD): float
    {
        $T = ($JD - 2451545.0) / 36525.0;
        $L = 218.3164477 + 481267.88123421 * $T;
        $D = 297.8501921 + 445267.1114034 * $T;
        $M  = 357.5291092 + 35999.0502909 * $T;
        $Mp = 134.9633964 + 477198.8675055 * $T;
        $F = 93.2720950 + 483202.0175233 * $T;
        $D  = deg2rad(fmod($D,  360));
        $M  = deg2rad(fmod($M,  360));
        $Mp = deg2rad(fmod($Mp, 360));
        $F  = deg2rad(fmod($F,  360));
        $sumL = 6288774 * sin($Mp) + 1274027 * sin(2*$D - $Mp) + 658314  * sin(2*$D) + 213618  * sin(2*$Mp) - 185116  * sin($M) - 114332  * sin(2*$F) + 58793   * sin(2*$D - 2*$Mp) + 57066   * sin(2*$D - $M - $Mp) + 53322   * sin(2*$D + $Mp) + 45758   * sin(2*$D - $M) - 40923   * sin($M - $Mp) - 34720   * sin($D) - 30383   * sin($M + $Mp);
        $tropicalLon = fmod($L + $sumL / 1000000.0, 360);
        if ($tropicalLon < 0) $tropicalLon += 360;
        $ayanamsa = $this->getLahiriAyanamsa($JD);
        return fmod($tropicalLon - $ayanamsa + 360, 360);
    }

    public function getRasi(float $longitude): array
    {
        $rasiIndex = floor($longitude / 30);
        $degInRasi = fmod($longitude, 30);
        return [
            'index'       => (int) $rasiIndex,
            'name_tamil'  => $this->rasiNames[$rasiIndex]['tamil'],
            'name_english'=> $this->rasiNames[$rasiIndex]['english'],
            'lord'        => $this->rasiNames[$rasiIndex]['lord'],
            'degree'      => round($degInRasi, 4),
        ];
    }

    public function getNakshatra(float $moonLongitude): array
    {
        $nakshatraSpan  = 360.0 / 27.0; 
        $padaSpan       = $nakshatraSpan / 4.0; 
        $nakshatraIndex = floor($moonLongitude / $nakshatraSpan);
        $degInNakshatra = fmod($moonLongitude, $nakshatraSpan);
        $padaNumber     = floor($degInNakshatra / $padaSpan) + 1; 
        return [
            'index'  => (int) $nakshatraIndex,
            'name'   => $this->nakshatras[$nakshatraIndex]['name'],
            'lord'   => $this->nakshatras[$nakshatraIndex]['lord'],
            'devata' => $this->nakshatras[$nakshatraIndex]['devata'],
            'pada'   => (int) $padaNumber,
            'degree' => round($degInNakshatra, 4),
        ];
    }

    public function getLagna(float $JD, float $latitude, float $longitude): array
    {
        $T  = ($JD - 2451545.0) / 36525.0;
        $GMST = 100.4606184 + 36000.77004 * $T + 0.000387933 * $T * $T - ($T * $T * $T) / 38710000;
        $GMST = fmod($GMST, 360);
        $LST = fmod($GMST + $longitude + 360, 360);
        $epsilon = 23.4392911 - 0.013004167 * $T;
        $epsilon  = deg2rad($epsilon);
        $latRad   = deg2rad($latitude);
        $LSTR     = deg2rad($LST);
        $tanAsc = cos($LSTR) / (-sin($LSTR) * cos($epsilon) - tan($latRad) * sin($epsilon));
        $asc    = rad2deg(atan($tanAsc));
        if ($asc < 0) $asc += 180;
        if (cos($LSTR) < 0) $asc += 180;
        $asc = fmod($asc, 360);
        $ayanamsa = $this->getLahiriAyanamsa($JD);
        $siderealAsc = fmod($asc - $ayanamsa + 360, 360);
        return $this->getRasi($siderealAsc);
    }

    public function getRahuLongitude(float $JD): float
    {
        $T    = ($JD - 2451545.0) / 36525.0;
        $rahu = 125.0445479 - 1934.1362608 * $T + 0.0020754 * $T * $T;
        $rahu = fmod($rahu + 360, 360);
        $ayanamsa = $this->getLahiriAyanamsa($JD);
        return fmod($rahu - $ayanamsa + 360, 360);
    }

    public function getMarsPosition($JD) { return $this->dummyPosition($JD, 0.5); }
    public function getMercuryPosition($JD) { return $this->dummyPosition($JD, 0.2); }
    public function getJupiterPosition($JD) { return $this->dummyPosition($JD, 0.08); }
    public function getVenusPosition($JD) { return $this->dummyPosition($JD, 0.6); }
    public function getSaturnPosition($JD) { return $this->dummyPosition($JD, 0.03); }

    private function dummyPosition($JD, $speed) {
        $lon = fmod($JD * $speed, 360);
        return [
            'longitude'  => $lon,
            'rasi_index' => floor($lon / 30),
            'rasi'       => $this->getRasi($lon),
            'nakshatra'  => $this->getNakshatra($lon),
        ];
    }

    public function getAllGrahaPositions(float $JD): array
    {
        $positions = [];
        $sunLon = $this->getSunLongitude($JD);
        $positions['சூரியன்'] = [
            'longitude'  => $sunLon,
            'rasi_index' => (int) floor($sunLon / 30),
            'rasi'       => $this->getRasi($sunLon),
            'nakshatra'  => $this->getNakshatra($sunLon),
        ];
        $moonLon = $this->getMoonLongitude($JD);
        $positions['சந்திரன்'] = [
            'longitude'  => $moonLon,
            'rasi_index' => (int) floor($moonLon / 30),
            'rasi'       => $this->getRasi($moonLon),
            'nakshatra'  => $this->getNakshatra($moonLon),
        ];
        $rahuLon = $this->getRahuLongitude($JD);
        $positions['ராகு'] = [
            'longitude'  => $rahuLon,
            'rasi_index' => (int) floor($rahuLon / 30),
            'rasi'       => $this->getRasi($rahuLon),
            'retrograde' => true,
        ];
        $kethuLon = fmod($rahuLon + 180, 360);
        $positions['கேது'] = [
            'longitude'  => $kethuLon,
            'rasi_index' => (int) floor($kethuLon / 30),
            'rasi'       => $this->getRasi($kethuLon),
            'retrograde' => true,
        ];
        $positions['செவ்வாய்'] = $this->getMarsPosition($JD);
        $positions['புதன்']    = $this->getMercuryPosition($JD);
        $positions['குரு']     = $this->getJupiterPosition($JD);
        $positions['சுக்கிரன்']= $this->getVenusPosition($JD);
        $positions['சனி']      = $this->getSaturnPosition($JD);
        return $positions;
    }

    public function buildHouseChart(int $lagnaRasiIndex, array $grahaPositions): array
    {
        $houses = [];
        for ($i = 1; $i <= 12; $i++) {
            $houseRasiIndex = ($lagnaRasiIndex + $i - 1) % 12;
            $houses[$i] = [
                'house_number' => $i,
                'rasi'         => $this->rasiNames[$houseRasiIndex],
                'rasi_index'   => $houseRasiIndex,
                'house_name_tamil' => $this->houseNames[$i],
                'grahas'       => [],
            ];
        }
        foreach ($grahaPositions as $grahaName => $grahaData) {
            $grahaRasi = $grahaData['rasi_index'];
            $houseNum  = (($grahaRasi - $lagnaRasiIndex + 12) % 12) + 1;
            $houses[$houseNum]['grahas'][] = $grahaName;
        }
        return $houses;
    }
}
