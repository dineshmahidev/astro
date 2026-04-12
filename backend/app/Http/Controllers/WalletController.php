<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Razorpay\Api\Api;
use Illuminate\Support\Facades\Log;
 
class WalletController extends Controller
{
    public function getBalance(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'status' => 'success',
            'data' => [
                'wallet_balance' => (float) $user->wallet_balance,
                'reward_balance' => (float) $user->reward_balance,
                'free_access_until' => $user->free_access_until,
                'is_free_access_active' => $user->free_access_until ? Carbon::now()->lt($user->free_access_until) : false
            ]
        ]);
    }

    /**
     * Create a Razorpay Order
     */
    public function createRazorpayOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10'
        ]);

        $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));

        try {
            $order = $api->order->create([
                'receipt' => 'order_rcptid_' . time(),
                'amount' => $request->amount * 100, // Amount in paise
                'currency' => 'INR'
            ]);

            return response()->json([
                'status' => 'success',
                'order_id' => $order['id'],
                'amount' => $order['amount'],
                'key' => env('RAZORPAY_KEY_ID')
            ]);
        } catch (\Exception $e) {
            Log::error('Razorpay Order Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Unable to create order'], 500);
        }
    }

    /**
     * Verify Razorpay Payment Signature
     */
    public function verifyRazorpayPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required',
            'razorpay_payment_id' => 'required',
            'razorpay_signature' => 'required',
            'amount' => 'required|numeric'
        ]);

        $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));

        try {
            $attributes = [
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature
            ];

            $api->utility->verifyPaymentSignature($attributes);

            // If verification passes, update wallet
            $user = $request->user();
            $user->wallet_balance += $request->amount;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Payment verified and wallet updated',
                'new_balance' => (float) $user->wallet_balance
            ]);
        } catch (\Exception $e) {
            Log::error('Razorpay Verify Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Payment verification failed'], 400);
        }
    }

    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10|max:100'
        ]);

        $user = $request->user();
        $user->wallet_balance += $request->amount;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Wallet topped up successfully',
            'new_balance' => (float) $user->wallet_balance
        ]);
    }

    public function addReward(Request $request)
    {
        $user = $request->user();
        
        if ($user->reward_balance >= 10) {
           return response()->json(['status' => 'error', 'message' => 'Reward limit reached. Please redeem first.'], 400);
        }

        $user->reward_balance += 2.00;
        $user->save();

        return response()->json([
            'status' => 'success',
            'reward_balance' => (float) $user->reward_balance
        ]);
    }

    public function redeemReward(Request $request)
    {
        $user = $request->user();

        if ($user->reward_balance < 10) {
            return response()->json(['status' => 'error', 'message' => 'Insufficient rewards'], 400);
        }

        // Add 10 to wallet
        $user->wallet_balance += 10;
        $user->reward_balance = 0;
        
        // Add 20 mins free access
        $currentUntil = $user->free_access_until ? Carbon::parse($user->free_access_until) : Carbon::now();
        if ($currentUntil->lt(Carbon::now())) {
            $currentUntil = Carbon::now();
        }
        
        $user->free_access_until = $currentUntil->addMinutes(20);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Reward redeemed! 20 mins free access granted.',
            'new_balance' => (float) $user->wallet_balance,
            'free_access_until' => $user->free_access_until
        ]);
    }

    public function debit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1'
        ]);

        $user = $request->user();
        if ($user->wallet_balance < $request->amount) {
            return response()->json(['status' => 'error', 'message' => 'Insufficient divine balance.'], 402);
        }

        $user->wallet_balance -= $request->amount;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Balance deducted',
            'new_balance' => (float) $user->wallet_balance
        ]);
    }
}
