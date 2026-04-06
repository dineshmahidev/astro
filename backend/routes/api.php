<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BirthChartController;
use App\Http\Controllers\PredictionController;
use App\Http\Controllers\CompatibilityController;
use App\Http\Controllers\DailyPalangalController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\PalmReadingController;
use App\Http\Controllers\NotificationController;

Route::post('/palm-reading/analyze', [PalmReadingController::class, 'store']);
Route::get('/palm-readings', [PalmReadingController::class, 'index'])->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/update-profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');

Route::post('/calculate-chart', [BirthChartController::class, 'calculate']);
Route::post('/dasha-bhukti', [BirthChartController::class, 'getDashaBhukti']);
Route::post('/save-chart', [BirthChartController::class, 'store']);
Route::get('/daily-palangal/{rasi_index}', [DailyPalangalController::class, 'show']);
Route::get('/daily-impacts/{rasi_index}', [DailyPalangalController::class, 'nextFiveDays']);
Route::get('/detailed-daily', [DailyPalangalController::class, 'detailedAnalysis']);
Route::get('/me/daily-impacts', [DailyPalangalController::class, 'myDailyImpacts'])->middleware('auth:sanctum');
Route::post('/porutham-match', [CompatibilityController::class, 'match']);
Route::get('/porutham-dashboard', [CompatibilityController::class, 'dashboard'])->middleware('auth:sanctum');
Route::post('/chat', [ChatBotController::class, 'message'])->middleware('auth:sanctum');
Route::get('/transit', [BirthChartController::class, 'transit'])->middleware('auth:sanctum');
Route::get('/lucky', [BirthChartController::class, 'lucky'])->middleware('auth:sanctum');
Route::get('/life-predictions', [PredictionController::class, 'lifePredictions'])->middleware('auth:sanctum');
Route::get('/predictions/categories', [PredictionController::class, 'getCategories']);
Route::get('/predictions/questions/{catCode}', [PredictionController::class, 'getQuestions']);
Route::get('/predictions/answer/{code}', [PredictionController::class, 'getAnswer']);
Route::post('/predictions/detailed', [PredictionController::class, 'getDetailedReport'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', 'App\\Http\\Controllers\\NotificationController@index');
    Route::post('/notifications/read-all', 'App\\Http\\Controllers\\NotificationController@markAllAsRead');
    Route::post('/notifications/{id}/read', 'App\\Http\\Controllers\\NotificationController@markAsRead');
    Route::delete('/notifications/{id}', 'App\\Http\\Controllers\\NotificationController@destroy');

    // Wallet & Rewards
    Route::get('/wallet/balance', 'App\\Http\\Controllers\\WalletController@getBalance');
    Route::post('/wallet/topup', 'App\\Http\\Controllers\\WalletController@topup');
    Route::post('/wallet/reward', 'App\\Http\\Controllers\\WalletController@addReward');
    Route::post('/wallet/redeem', 'App\\Http\\Controllers\\WalletController@redeemReward');
});
