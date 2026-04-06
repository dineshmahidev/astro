<?php

namespace App\Services;

class PalmAnalysisService
{
    public function analyze($metrics)
    {
        // Use real metrics passed from Python script
        $lifeLength = $metrics['life_line_length'] ?? 5.0;
        $headType = $metrics['head_line_type'] ?? 'straight';
        $heartType = $metrics['heart_line_type'] ?? 'curved';
        $heartLength = $metrics['heart_line_length'] ?? 6.0;
        $fatePresent = $metrics['fate_line_present'] ?? true;

        $tamilResults = [
            'personality' => $this->interpretPersonality($headType, $heartType),
            'health' => $this->interpretHealth($lifeLength),
            'career' => $this->interpretCareer($fatePresent, $headType),
            'relationship' => $this->interpretRelationship($heartType),
            'lifespan' => $this->interpretLifespan($lifeLength),
            'summary' => "உங்கள் கைரேகை ஆய்வு வெற்றிகரமாக முடிந்தது. உங்கள் பலமான கோடுகள் மற்றும் மேடுகள் ஒரு சிறப்பான எதிர்காலத்தைக் குறிக்கின்றன.",
            
            // UI specific keys
            'lifeLine' => $this->interpretLifespan($lifeLength),
            'heartLine' => $this->interpretRelationship($heartType),
            'headLine' => $this->interpretPersonality($headType, $heartType),
            'fateLine' => $fatePresent ? "சிறப்பான தொழில் யோகம் மற்றும் சீரான வளர்ச்சி." : "சுய உழைப்பால் முன்னேற்ற பாதையில் செல்வீர்கள்.",
            'sunLine' => "சமூகத்தில் மதிப்பும் மரியாதையும் அதிகரிக்க வாய்ப்பு.",
            'mercuryLine' => "வியாபார நுணுக்கம் மற்றும் வாக்கு சாதுர்யம் கொண்டவர்.",
            'travelLine' => "வெளிநாட்டுப் பயணம் அல்லது தூர தேசப் பயணங்கள் அமைய வாய்ப்பு.",
            'marriageLine' => "சீரான மற்றும் மகிழ்ச்சியான திருமண வாழ்க்கை அமையும்.",
            'mounts' => "குரு மற்றும் சுக்கிர மேடுகள் பலமாக உள்ளதால் தலைமைப் பண்பு மற்றும் செழிப்பு உண்டாகும்."
        ];

        return [
            'metrics' => [
                'life_line_length' => $lifeLength,
                'head_line_type' => $headType,
                'heart_line_type' => $heartType,
                'heart_line_length' => $heartLength,
                'fate_line_present' => $fatePresent,
            ],
            'tamil' => $tamilResults
        ];
    }

    private function interpretLifespan($len)
    {
        if ($len >= 7) return "நீண்ட ஆயுள் மற்றும் வலுவான உடல்நிலை (Long life & Vitality)";
        if ($len >= 5) return "மிதமான ஆயுள், சீரான ஆரோக்கியம் (Average life, Moderate health)";
        return "உடல் ஆரோக்கியத்தில் கூடுதல் கவனம் தேவை (Needs health attention)";
    }

    private function interpretHealth($len)
    {
        return $len >= 6 ? "உடல் வலுவாகவும், நோய் எதிர்ப்பு சக்தி அதிகமாகவும் இருக்கும்." : "சீரான உணவு மற்றும் உடற்பயிற்சி அவசியம்.";
    }

    private function interpretPersonality($head, $heart)
    {
        $text = $head === 'straight' ? "நியாயமான மற்றும் எதார்த்தமான சிந்தனை கொண்டவர். " : "படைப்பாற்றல் மற்றும் கற்பனைத் திறன் மிக்கவர். ";
        $text .= $heart === 'curved' ? "மென்மையான மற்றும் உணர்ச்சிப்பூர்வமான குணம்." : "தர்க்கரீதியான மற்றும் நிதானமான அன்பு.";
        return $text;
    }

    private function interpretCareer($fate, $head)
    {
        if (!$fate) return "சுதந்திரமான தொழில் அல்லது சுயதொழில் வாய்ப்புகள் அதிகம்.";
        return $head === 'straight' ? "நிர்வாகம் மற்றும் தலைமைப் பதவிகளில் ஜொலிப்பீர்கள்." : "கலை மற்றும் தகவல் தொடர்பு சார்ந்த துறையில் வெற்றி.";
    }

    private function interpretRelationship($heart)
    {
        return $heart === 'curved' ? "ஆழ்ந்த அன்பும் விசுவாசமும் கொண்ட வாழ்க்கை துணை அமைவார்." : "அன்பில் நேர்மையும் நிதானமும் கொண்டவர்.";
    }
}
