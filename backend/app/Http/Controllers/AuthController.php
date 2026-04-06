<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Services\AstrologyCalculationService;
 
class AuthController extends Controller
{
    private AstrologyCalculationService $calc;
 
    public function __construct(AstrologyCalculationService $calc)
    {
        $this->calc = $calc;
    }
 
    public function register(Request $request) {
        $validator = \Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'The email has already been taken or invalid data provided.', 'errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        
        $rasi = $data['rasi'] ?? null;
        $nakshatra = $data['nakshatra'] ?? null;
        $padam = $data['padam'] ?? null;
 
        if ((!isset($data['rasi']) || empty($data['rasi'])) && isset($data['dob']) && isset($data['tob'])) {
             $dob = $data['dob'];
             $tob = $data['tob'];
             $lat = 11.3410; // Default Erode
             $lon = 77.7172;
             
             $dt = new \DateTime($dob . ' ' . $tob);
             $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
             $JD = $this->calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
             $moonLon = $this->calc->getMoonLongitude($JD);
             $moonRasiData = $this->calc->getRasi($moonLon);
             $nakData = $this->calc->getNakshatra($moonLon);
             
             $rasi = $moonRasiData['name_english'] . ' / ' . $moonRasiData['name_tamil'];
             $nakshatra = $nakData['name'];
             $padam = $nakData['pada'];
        }
 
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'gender' => $data['gender'] ?? null,
            'dob' => $data['dob'] ?? null,
            'tob' => $data['tob'] ?? null,
            'profession' => $data['profession'] ?? null,
            'rasi' => $rasi,
            'nakshatra' => $nakshatra,
            'padam' => $padam
        ]);
 
        $token = $user->createToken('auth_token')->plainTextToken;
 
        return response()->json([
            'status' => 'success',
            'token' => $token,
            'rasi' => $user->rasi,
            'nakshatra' => $user->nakshatra,
            'padam' => $user->padam
        ]);
    }
 
    public function login(Request $request) {
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['status' => 'success', 'token' => $token]);
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        $data = $request->all();

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['profession'])) $user->profession = $data['profession'];
        if (isset($data['pob'])) $user->pob = $data['pob'];
        if (isset($data['avatar_url'])) $user->avatar_url = $data['avatar_url'];
        
        $dobChanged = isset($data['dob']) && $data['dob'] !== $user->dob;
        $tobChanged = isset($data['tob']) && $data['tob'] !== $user->tob;
        
        if (isset($data['dob'])) $user->dob = $data['dob'];
        if (isset($data['tob'])) $user->tob = $data['tob'];

        // Recalculate if birth data changed
        if ($dobChanged || $tobChanged) {
             $lat = 11.3410; // Default Erode
             $lon = 77.7172;
             
             $dt = new \DateTime($user->dob . ' ' . $user->tob);
             $hr = (float) $dt->format('H') + ($dt->format('i') / 60);
             $JD = $this->calc->getJulianDay((int)$dt->format('Y'), (int)$dt->format('m'), (int)$dt->format('d'), $hr);
             $moonLon = $this->calc->getMoonLongitude($JD);
             $moonRasiData = $this->calc->getRasi($moonLon);
             $nakData = $this->calc->getNakshatra($moonLon);
             
             $user->rasi = $moonRasiData['name_english'] . ' / ' . $moonRasiData['name_tamil'];
             $user->nakshatra = $nakData['name'];
             $user->padam = $nakData['pada'];
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'user' => $user
        ]);
    }
}
