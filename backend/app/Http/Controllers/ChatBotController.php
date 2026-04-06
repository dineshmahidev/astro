<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ApiKey;

class ChatBotController extends Controller
{
    private array $rules = [
        // Marriage Luck
        'marriage' => 'Your 7th house and Venus (Sukran) position determine your marriage luck. Currently, your chart shows a positive phase for marriage proposals.',
        'luck'     => 'Your 7th house and Venus (Sukran) position determine your marriage luck. Currently, your chart shows a positive phase for marriage proposals.',
        'கல்யாண'   => 'உங்கள் ஜாதகத்தில் 7-ம் இடம் மற்றும் சுக்கிரன் நிலையை பொறுத்து திருமண யோகம் அமையும். தற்போது நல்ல காலம் தான்.',
        
        // Dosha
        'dosha'    => 'Kuja Dosha (Sevvai Dosha) is an important consideration. Remedies like visiting the Vaithiswaran Temple or performing Pariharam can help.',
        'செவ்வாய்'  => 'செவ்வாய் தோஷம் சரிசெய்ய வைதீஸ்வரன் கோவில் தரிசனம் அல்லது பரிகாரங்கள் உதவும்.',
        'papai'    => 'Papa Samya balance is crucial for matching. Avoid matching with high Papa Samya charts.',
        
        // Matching/Compatibility
        'matching' => 'Compatibility is based on 10 poruthams. Rasi and Nakshatra matches are primary for long-term harmony.',
        'பொருத்தம்' => '10 பொருத்தங்கள் அடிப்படையில் திருமண பொருத்தம் கணிக்கப்படுகிறது. ராசி மற்றும் நட்சத்திர பொருத்தம் மிக முக்கியம்.',
        
        // Muhurtham
        'muhurtham' => 'Shubha Muhurthams are calculated based on Tithi, Nakshatra, and Yoga. The next month has several auspicious dates.',
        'முஹூர்த்தம்' => 'திதி, நட்சத்திரம் மற்றும் யோகம் அடிப்படையில் சுப முஹூர்த்தங்கள் கணிக்கப்படுகின்றன. அடுத்த மாதத்தில் நல்ல தேதிகள் உள்ளன.',
    ];


    public function message(Request $request)
    {
        $user = $request->user();
        $msg = $request->input('message', '');
        
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        // 1. Fetch Current Dasha/Bhukti Context
        $currentDashaInfo = "Unknown";
        try {
            $calc = new \App\Services\AstrologyCalculationService();
            $engine = new \App\Services\PredictionEngine();
            
            $dt = new \DateTime($user->dob . ' ' . $user->tob);
            $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
            $JD = $calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
            $moonLon = $calc->getMoonLongitude($JD);
            $nakshatra = $calc->getNakshatra($moonLon);
            $dashas = $engine->calculateVimshottariDasha($nakshatra, $user->dob . ' ' . $user->tob);
            
            // Find currently active dasha
            $now = new \DateTime();
            foreach ($dashas as $d) {
                if ($now >= new \DateTime($d['start_date']) && $now <= new \DateTime($d['end_date'])) {
                    $currentDashaInfo = "Mahadasha: {$d['lord']}, Dates: {$d['start_date']} to {$d['end_date']}. ";
                    // Find bhukti
                    foreach ($d['antardasha'] as $a) {
                        if ($now >= new \DateTime($a['start_date']) && $now <= new \DateTime($a['end_date'])) {
                            $currentDashaInfo .= "Current Bhukti: {$a['lord']}.";
                            break;
                        }
                    }
                    break;
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Context calculation error: " . $e->getMessage());
        }

        // 2. User Context (Anonymous for Privacy)
        $userContext = "DOB: {$user->dob}, TOB: {$user->tob}, Location: {$user->pob}, ";
        $userContext .= "Rasi: {$user->rasi}, Nakshatra: {$user->nakshatra}, Padam: {$user->padam}. ";
        $userContext .= "CURRENT CELESTIAL PHASE: {$currentDashaInfo}";

        // 3. System Prompt for 'Mai'
        $systemPrompt = "Your name is 'Mai' (மை), a legendary Divine Wizard and Sage. 
        PERSONALITY: Bold, extremely straightforward, and direct. Do not use 'valavala' (vague or unnecessary) explanations. 
        RULES: Give straight answers to the user's questions. If the outcome is negative, do not hesitate to state it clearly. Be brief but accurate.
        RESPONSE LANGUAGE: ALWAYS respond in Professional TAMIL (தமிழ்).
        User Context: {$userContext}";

        // 4. Session Retrieval (Chat Continuity)
        $oneHourAgo = now()->subHour();
        $session = \App\Models\ChatSession::where('user_id', $user->id)
            ->where('updated_at', '>', $oneHourAgo)
            ->orderBy('updated_at', 'desc')
            ->first();

        $historyMessages = [];
        if ($session && is_array($session->messages)) {
            // Take last 5 messages for context
            $recentMessages = array_slice($session->messages, -5);
            foreach ($recentMessages as $m) {
                $historyMessages[] = [
                    'role' => $m['role'],
                    'content' => $m['content']
                ];
            }
        }

        $reply = null;
        $aiMode = env('AI_MODE', 'groq');

        try {
            // 1. Try DeepSeek (Native API) - THE PRIMARY API
            if (!$reply && (env('AI_MODE') === 'deepseek' || $aiMode === 'deepseek' || true)) {
                $deepseekKeys = ApiKey::where('service', 'deepseek')->where('is_active', true)->inRandomOrder()->get();
                
                foreach ($deepseekKeys as $dsKey) {
                    $response = \Illuminate\Support\Facades\Http::withToken($dsKey->key)
                        ->timeout(20)
                        ->post('https://api.deepseek.com/chat/completions', [
                            'model' => 'deepseek-chat',
                            'messages' => array_merge([['role' => 'system', 'content' => $systemPrompt]], $historyMessages, [['role' => 'user', 'content' => $msg]]),
                            'temperature' => 0.6,
                        ]);
                        
                    if ($response->successful()) {
                        $reply = $response->json()['choices'][0]['message']['content'];
                        break; // Success with current key
                    } else {
                        \Log::warning("DeepSeek Key Error (Trying next): " . substr($dsKey->key, 0, 8));
                    }
                }
            }

            // 2. Try HuggingFace (Model Hosting)
            if (!$reply && ($aiMode === 'huggingface' || !$reply)) {
                $hfKeyRecord = ApiKey::where('service', 'huggingface')->where('is_active', true)->first();
                $tokens = [];
                if (!empty($user->hf_token)) $tokens[] = trim($user->hf_token);
                if ($hfKeyRecord) $tokens[] = trim($hfKeyRecord->key);
                
                $modelId = env('HF_MODEL_ID', 'HectorHe/DeepSeek-V2-Lite-aux-free-sft-math7k-1epoch-1e-4-gamma');
                $hfEndpoint = "https://api-inference.huggingface.co/models/{$modelId}";
                $hfPrompt = "{$systemPrompt}\n\n" . implode("\n", array_map(fn($m) => (($m['role'] === 'user') ? "User: " : "Mai: ") . $m['content'], $historyMessages)) . "\nUser: {$msg}\nMai: ";

                foreach ($tokens as $token) {
                    $response = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => "Bearer {$token}"])
                        ->timeout(20)->post($hfEndpoint, ['inputs' => $hfPrompt, 'parameters' => ['max_new_tokens' => 500, 'temperature' => 0.5, 'return_full_text' => false]]);
                    if ($response->successful()) {
                        $reply = trim(str_replace('Mai: ', '', $response->json()[0]['generated_text'] ?? ''));
                        if ($reply) break;
                    }
                }
            }

            // 3. Try Groq (Llama) - General Fallback
            if (!$reply) {
                $groqKey = ApiKey::where('service', 'groq')->where('is_active', true)->first();
                $apiKey = $groqKey ? $groqKey->key : env('GROK_API_KEY');
                
                if ($apiKey) {
                    $response = \Illuminate\Support\Facades\Http::withToken($apiKey)
                        ->timeout(20)
                        ->post('https://api.groq.com/openai/v1/chat/completions', [
                            'model' => 'llama-3.3-70b-versatile',
                            'messages' => array_merge([['role' => 'system', 'content' => $systemPrompt]], $historyMessages, [['role' => 'user', 'content' => $msg]]),
                            'temperature' => 0.5,
                        ]);
                    if ($response->successful()) $reply = $response->json()['choices'][0]['message']['content'];
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("AI Error: " . $e->getMessage());
            $reply = "மன்னிக்கவும், விண்மீன்களின் தொடர்பு துண்டிக்கப்பட்டுள்ளது. நேரடியான பதில்: உங்கள் ஜாதகம் தற்போது ஒரு மாறுதல் நிலையில் உள்ளது.";
        }

        if (!$reply) {
            $reply = "விதியின் வழியில் சிறு தாமதம். 🔮✨";
        }

        // 5. Store Session History
        if (!$session) {
            $session = new \App\Models\ChatSession();
            $session->user_id = $user->id;
            $session->birth_chart_id = 0; // Legacy field
            $session->messages = [];
        }

        $messages = $session->messages;
        $messages[] = ['role' => 'user', 'content' => $msg, 'time' => now()->format('H:i')];
        $messages[] = ['role' => 'assistant', 'content' => $reply, 'time' => now()->format('H:i')];
        $session->messages = $messages;
        $session->save();
        
        return response()->json([
            'status' => 'success',
            'response' => $reply,
            'reply' => $reply,
            'session_id' => $session->id
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error'], 401);

        $sessions = \App\Models\ChatSession::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'sessions' => $sessions
        ]);
    }
}
