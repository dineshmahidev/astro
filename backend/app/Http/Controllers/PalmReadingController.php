<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PalmReadingController extends Controller
{
    private \App\Services\PalmAnalysisService $palmService;

    public function __construct(\App\Services\PalmAnalysisService $palmService)
    {
        $this->palmService = $palmService;
    }

    /**
     * Store and analyze palm reading.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|string', 
            'hand_type' => 'nullable|string'
        ]);

        // 1. Save Base64 to Temporary File
        $imageData = $request->image;
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc
        } else {
            return response()->json(['status' => 'error', 'message' => 'தவறான புகைப்பட வடிவம். (Invalid image format)'], 400);
        }
        $imageData = base64_decode($imageData);
        $tempPath = storage_path('app/temp_palm_' . time() . '.jpg');
        file_put_contents($tempPath, $imageData);

        // 2. Call Python Analyzer with Windows-compat check
        $scriptPath = base_path('palm_analyzer.py');
        $commands = ["python", "python3", "py"];
        $output = null;
        $result = null;

        foreach ($commands as $cmd) {
            $fullCommand = "$cmd $scriptPath \"$tempPath\" 2>&1";
            $output = shell_exec($fullCommand);
            $result = json_decode($output, true);
            if ($result && !isset($result['error'])) break;
        }

        // Clean up temp file
        @unlink($tempPath);

        if (!$result || isset($result['error'])) {
            $errorMsg = $result['error'] ?? 'கைரேகை ஆய்வு கருவி தயார் நிலையில் இல்லை. (Analyzer not ready)';
            \Illuminate\Support\Facades\Log::error("Palm Analyzer Error: " . ($output ?? 'No output'));
            return response()->json(['status' => 'error', 'message' => $errorMsg], 500);
        }

        if (!$result['is_palm']) {
            return response()->json([
                'status' => 'error', 
                'message' => 'மன்னிக்கவும்! உங்கள் உள்ளங்கை படத்தில் தெளிவாக தெரியவில்லை. தயவுசெய்து கையை கேமராவிற்கு நேராக காட்டி மீண்டும் எடுக்கவும். 😇🖐️'
            ], 422);
        }

        // 3. Process Real Analysis
        $analysis = $this->palmService->analyze($result['metrics']);

        $reading = \App\Models\PalmReading::create([
            'user_id' => $request->user()?->id,
            'image_path' => 'captured_palm_' . time() . '.jpg',
            'detection_confidence' => $result['confidence'] ?? 0.9,
            'life_line_length' => $analysis['metrics']['life_line_length'],
            'head_line_type' => $analysis['metrics']['head_line_type'],
            'heart_line_length' => $analysis['metrics']['heart_line_length'],
            'fate_line_present' => $analysis['metrics']['fate_line_present'],
            'tamil_results' => $analysis['tamil'],
            'hand_type' => $request->hand_type ?? 'right',
            'gender' => $request->gender ?? 'male'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $reading
        ]);
    }

    /**
     * Display a listing of the user's palm readings history.
     */
    public function index(Request $request)
    {
        $readings = \App\Models\PalmReading::where('user_id', $request->user()?->id)->latest()->get();

        $history = $readings->map(function ($reading) {
            return [
                'id' => $reading->id,
                'date' => $reading->created_at->format('M d, Y'),
                'imageUrl' => $reading->image_path,
                'analysis' => [
                    'summary' => $reading->tamil_results ?? 'No analysis available',
                ]
            ];
        });

        return response()->json([
            'status' => 'success',
            'history' => $history
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
