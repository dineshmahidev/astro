<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\AstrologyCalculationService;
use App\Services\PredictionEngine;

class PredictionController extends Controller
{
    private AstrologyCalculationService $calc;
    private PredictionEngine $prediction;

    public function __construct(AstrologyCalculationService $calc, PredictionEngine $prediction)
    {
        $this->calc = $calc;
        $this->prediction = $prediction;
    }

    public function lifePredictions(Request $request)
    {
        $user = $request->user();
        
        // Use user's birth data from profile
        $dob = $user->dob ?? '2000-01-01';
        $tob = $user->tob ?? '12:00';
        
        $dt = new \DateTime($dob . ' ' . $tob);
        $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
        $JD = $this->calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
        $moonLon = $this->calc->getMoonLongitude($JD);
        $nakshatra = $this->calc->getNakshatra($moonLon);
        
        $dashas = $this->prediction->calculateVimshottariDasha($nakshatra, $dob . ' ' . $tob);

        $results = [];
        $dashaMeanings = [
            'கேது' => [
                'icon' => 'sparkles',
                'en' => 'Ketu Dasha: A period focusing on spiritual growth, detachment, and sudden changes. You will find inner wisdom during this phase.',
                'ta' => 'கேது தசை: ஆன்மீக வளர்ச்சி, பற்றற்ற நிலை மற்றும் திடீர் மாற்றங்களில் கவனம் செலுத்தும் காலம். இந்த கட்டத்தில் நீங்கள் உங்கள் ஆத்ம ஞானத்தைக் கண்டறிவீர்கள்.'
            ],
            'சுக்கிரன்' => [
                'icon' => 'heart',
                'en' => 'Venus Dasha: A 20-year golden period for love, luxury, marriage, and artistic success. Financial prosperity is highly likely.',
                'ta' => 'சுக்கிர தசை: காதல், ஆடம்பரம், திருமணம் மற்றும் கலை வெற்றிக்கான 20 ஆண்டுகால பொற்காலம். நிதி செழிப்பு மிகவும் சாத்தியம்.'
            ],
            'சூரியன்' => [
                'icon' => 'sunny',
                'en' => 'Sun Dasha: A time for authority, recognition, and professional rise. Leadership roles and social respect will be highlights.',
                'ta' => 'சூரிய தசை: அதிகாரம், அங்கீகாரம் மற்றும் தொழில்முறை உயர்வுக்கான நேரம். தலைமைப் பொறுப்புகள் மற்றும் சமூக மரியாதை முக்கிய இடத்தைப் பிடிக்கும்.'
            ],
            'சந்திரன்' => [
                'icon' => 'moon',
                'en' => 'Moon Dasha: Emotional balance, domestic happiness, and mental growth. Travel and creativity will bring joy during this decade.',
                'ta' => 'சந்திர தசை: உணர்ச்சி சமநிலை, குடும்ப மகிழ்ச்சி மற்றும் மன வளர்ச்சி. இந்த தசாப்தத்தில் பயணம் மற்றும் படைப்பாற்றல் மகிழ்ச்சியைத் தரும்.'
            ],
            'செவ்வாய்' => [
                'icon' => 'flashlight',
                'en' => 'Mars Dasha: Courage, energy, and real estate success. A period to complete hard tasks and overcome enemies through persistence.',
                'ta' => 'செவ்வாய் தசை: தைரியம், ஆற்றல் மற்றும் ரியல் எஸ்டேட் வெற்றி. கடினமான பணிகளை முடிக்கவும் விடாமுயற்சியால் எதிரிகளை வெல்லவும் கூடிய காலம்.'
            ],
            'ராகு' => [
                'icon' => 'cloud',
                'en' => 'Rahu Dasha: Materialistic expansion, foreign travel, and unconventional success. Watch out for illusions while pursuing big goals.',
                'ta' => 'ராகு தசை: பொருள்முதல்வாத விரிவாக்கம், வெளிநாட்டு பயணம் மற்றும் வழக்கத்திற்கு மாறான வெற்றி. பெரிய இலக்குகளைப் பின்தொடரும்போது மாயைகளில் கவனமாக இருங்கள்.'
            ],
            'குரு' => [
                'icon' => 'school',
                'en' => 'Jupiter Dasha: Wisdom, children, prosperity, and higher knowledge. The most expansive period for good deeds and spiritual fulfillment.',
                'ta' => 'குரு தசை: ஞானம், குழந்தைகள், செழிப்பு மற்றும் உயர் அறிவு. நற்செயல்கள் மற்றும் ஆன்மீக நிறைவிற்கான மிக விரிவான காலம்.'
            ],
            'சனி' => [
                'icon' => 'hammer',
                'en' => 'Saturn Dasha: Discipline, hard work, and long-term stability. While challenging, it builds a solid foundation for future reputation.',
                'ta' => 'சனி தசை: ஒழுக்கம், கடின உழைப்பு மற்றும் நீண்ட கால ஸ்திரத்தன்மை. சவாலானதாக இருந்தாலும், இது எதிர்கால நற்பெயருக்கு ஒரு உறுதியான அடித்தளத்தை உருவாக்குகிறது.'
            ],
            'புதன்' => [
                'icon' => 'book',
                'en' => 'Mercury Dasha: Intellectual activities, business success, and communication. Excellent for learning new languages or launching a venture.',
                'ta' => 'புதன் தசை: அறிவுசார் செயல்பாடுகள், வணிக வெற்றி மற்றும் தொடர்பு. புதிய மொழிகளைக் கற்க அல்லது ஒரு முயற்சியைத் தொடங்கச் சிறந்தது.'
            ]
        ];

        $antarMeaning = [
            'கேது' => 'Unexpected changes in plans. You might feel a bit lost or waste some time, but it leads to wisdom.',
            'சுக்கிரன்' => 'A beautiful time for love and family. Marriage or happy union is highly likely during this phase.',
            'சூரியன்' => 'Rise in social status. You will get more respect and a better job position.',
            'சந்திரன்' => 'Good for travel and peace of mind. You will find comfort and domestic happiness.',
            'செவ்வாய்' => 'New energy to buy a house or win a legal battle. Be careful with anger.',
            'ராகு' => 'Huge ambitions. You might struggle initially with money but will find success in foreign things.',
            'குரு' => 'The best time for luck. Children, wealth, and spiritual growth will follow you.',
            'சனி' => 'A period of hard work and delays. You might struggle with finance or lose a job, but it makes you stronger.',
            'புதன்' => 'Excellent for business or new learning. A new job or starting a venture is possible.'
        ];

        $antarMeaningTa = [
            'கேது' => 'திட்டங்களில் எதிர்பாராத மாற்றங்கள். நீங்கள் நேரத்தை வீணடிப்பதாக உணரலாம், ஆனால் அது ஞானத்திற்கு வழிவகுக்கும்.',
            'சுக்கிரன்' => 'காதல் மற்றும் குடும்பத்திற்கு ஒரு அழகான நேரம். இந்த கட்டத்தில் திருமணம் நடக்க அதிக வாய்ப்பு உள்ளது.',
            'சூரியன்' => 'அதிகாரப் பதவி தேடி வரும். உங்களுக்கு அதிக மரியாதையும் சிறந்த வேலையும் கிடைக்கும்.',
            'சந்திரன்' => 'பயணம் மற்றும் மன அமைதிக்கு நல்லது. நீங்கள் மகிழ்ச்சியாகவும் நிம்மதியாகவும் இருப்பீர்கள்.',
            'செவ்வாய்' => 'வீடு வாங்க அல்லது சட்டப் போராட்டத்தில் வெற்றி பெற புதிய ஆற்றல் கிடைக்கும். கோபத்தில் கவனமாக இருங்கள்.',
            'ராகு' => 'பெரிய லட்சியங்கள். ஆரம்பத்தில் பணத்திற்காகக் கஷ்டப்படலாம் ஆனால் வெளிநாட்டு விஷயங்களில் வெற்றி காண்பீர்கள்.',
            'குரு' => 'அதிர்ஷ்டத்திற்கான சிறந்த நேரம். குழந்தைகள், செல்வம் மற்றும் ஆன்மீக வளர்ச்சி உங்களைத் தொடரும்.',
            'சனி' => 'கடின உழைப்பு மற்றும் தாமதங்களின் காலம். பணத்தட்டுப்பாடு இருக்கலாம் அல்லது வேலை போகலாம், ஆனால் அது உங்களை பலப்படுத்தும்.',
            'புதன்' => 'வணிகம் அல்லது புதிய கற்றலுக்குச் சிறந்தது. புதிய வேலை அல்லது ஒரு தொழிலைத் தொடங்க வாய்ப்பு உள்ளது.'
        ];

        foreach($dashas as $d) {
            $lord = $d['lord'];
            $meaning = $dashaMeanings[$lord] ?? ['icon' => 'star', 'en' => 'Progressive period.', 'ta' => 'முன்னேற்ற காலம்.'];
            
            $startDate = new \DateTime($d['start_date']);
            $endDate = new \DateTime($d['end_date']);
            
            // Only show major periods or current/near future ones to keep it "Simple Tale"
            $results[] = [
                'category' => $startDate->format('Y') . ' - ' . $endDate->format('Y'),
                'title' => $lord . ' Phase',
                'title_ta' => $lord . ' காலம்',
                'prediction' => $meaning['en'],
                'prediction_ta' => $meaning['ta'],
                'icon' => $meaning['icon']
            ];

            // Add Antardashas with conversational style
            if (isset($d['antardasha'])) {
                foreach($d['antardasha'] as $antar) {
                    $antarLord = $antar['lord'];
                    $aStart = new \DateTime($antar['start_date']);
                    $aEnd = new \DateTime($antar['end_date']);
                    
                    // Filter to only show relevant years for a "Simple Tale" (e.g., current/next 5 years)
                    $now = new \DateTime();
                    $diff = $now->diff($aStart);
                    if ($diff->y > 10 && $aStart > $now) continue; // Skip too far future

                    $results[] = [
                        'category' => $aStart->format('M Y') . ' - ' . $aEnd->format('M Y'),
                        'title' => $antarLord . ' Influence',
                        'title_ta' => $antarLord . ' தாக்கம்',
                        'prediction' => ($antarMeaning[$antarLord] ?? 'Steady progress indicated.'),
                        'prediction_ta' => ($antarMeaningTa[$antarLord] ?? 'சீராக முன்னேற்றம் இருக்கும்.'),
                        'icon' => 'radio-button-on'
                    ];
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'predictions' => $results
        ]);
    }

    public function getCategories()
    {
        return response()->json([
            'status' => 'success',
            'categories' => [
                'Career' => 'Career',
                'Love' => 'Love',
                'Health' => 'Health',
                'Wealth' => 'Wealth',
                'Education' => 'Education',
                'Spirituality' => 'Spirituality'
            ]
        ]);
    }

    public function getQuestions(Request $request, $catCode)
    {
        $questions = [
            'Career' => [
                'Q1' => 'When will I get a job?',
                'Q2' => 'Will I get a promotion?',
                'Q3' => 'Should I start a business?'
            ],
            'Love' => [
                'Q4' => 'Marriage timing?',
                'Q5' => 'Life partner prediction?'
            ],
            'Health' => [
                'Q6' => 'Health prediction?'
            ],
            'Wealth' => [
                'Q7' => 'Financial growth?'
            ],
            'Education' => [
                'Q8' => 'Success in exams?'
            ],
            'Spirituality' => [
                'Q9' => 'Spiritual growth?'
            ]
        ];

        return response()->json([
            'status' => 'success',
            'questions' => $questions[$catCode] ?? []
        ]);
    }

    public function getAnswer(Request $request, $code)
    {
        $answers = [
            'Q1' => [
                'q' => 'Job Hunt Status',
                'ans_en' => 'The stars are aligned for your success. Mercury is well placed. A new opportunity will come in 4 months.',
                'ans_ta' => 'வெற்றிக்கு நட்சத்திரங்கள் துணை நிற்கின்றன. புதன் நன்றாக உள்ளார். அடுத்த 4 மாதங்களில் வேலை கிடைக்கும்.'
            ],
            'Q2' => [
                'q' => 'Promotion Chances',
                'ans_en' => 'Jupiter is entering a house of gains. A salary hike is likely within 6 months.',
                'ans_ta' => 'குரு பகவான் லாப ஸ்தானத்தில் நுழைகிறார். அடுத்த 6 மாதங்களில் பதவி உயர்வு கிடைக்க வாய்ப்புள்ளது.'
            ],
            'Q4' => [
                'q' => 'Marriage Time',
                'ans_en' => 'Venus influence is strong. Marital bliss is seen between Jan-June next year.',
                'ans_ta' => 'சுக்கிரனின் தாக்கம் அதிகமாக உள்ளது. அடுத்த வருடம் ஆரம்பத்தில் திருமண யோகம் உள்ளது.'
            ],
            'Q8' => [
                'q' => 'Exams',
                'ans_en' => 'Academic success is high. Focus on studies this quarter.',
                'ans_ta' => 'கல்வியில் வெற்றி நிச்சயம். இந்த காலாண்டில் படிப்பில் கவனம் செலுத்துங்கள்.'
            ]
        ];

        $ans = $answers[$code] ?? [
            'q' => 'Status',
            'ans_en' => 'The stars indicate a period of slow and steady growth.',
            'ans_ta' => 'உங்கள் நட்சத்திரங்களின் படி வரும் காலம் சீராக முன்னேற்றம் அளிப்பதாக அமையும்.'
        ];

        return response()->json([
            'status' => 'success',
            'prediction' => $ans
        ]);
    }

    public function getDetailedReport(Request $request)
    {
        $user = $request->user();
        $dasha = $request->input('dasha');
        $bhukti = $request->input('bhukti');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$dasha || !$bhukti) {
            return response()->json(['status' => 'error', 'message' => 'Dasha/Bhukti required'], 400);
        }

        $userContext = "Name: {$user->name}, DOB: {$user->dob}, TOB: {$user->tob}, Rasi: {$user->rasi}, Nakshatra: {$user->nakshatra}";
        
        $systemPrompt = "You are 'MiraAI', a master Vedic Astrologer. 
        Your task is to provide an EXTREMELY DETAILED 100-LINE REPORT (approx 800 words) for the user's specific Dasha and Bhukti.
        Identify patterns in Career, Health, Marriage, Wealth, and Spirituality.
        Tone: Very professional, insightful, and encouraging.
        LANGUAGE: TAMIL (தமிழ்).
        Structure the report with bullet points and clear sections.
        User Info: {$userContext}";

        $userMsg = "Explain the detailed impacts and future for: {$dasha} Mahadasha and {$bhukti} Antardasha from {$startDate} to {$endDate}. Provide a full 100-line comprehensive report covering all life aspects month-by-month and year-by-year.";

        try {
            $apiKey = env('GROK_API_KEY');
            $endpoint = 'https://api.groq.com/openai/v1/chat/completions';
            $model = 'llama-3.3-70b-versatile';

            $response = \Illuminate\Support\Facades\Http::withToken($apiKey)
                ->timeout(60) 
                ->post($endpoint, [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userMsg]
                    ],
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                $report = $response->json()['choices'][0]['message']['content'];
                return response()->json([
                    'status' => 'success',
                    'report' => $report
                ]);
            } else {
                throw new \Exception("AI API Error: " . $response->body());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Detailed Report Error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'ஆயிரக்கணக்கான விண்மீன்கள் கணக்கிடப்படுவதால் சிறிது தாமதமாகலாம். மீண்டும் முயற்சிக்கவும்.'
            ], 500);
        }
    }
}
