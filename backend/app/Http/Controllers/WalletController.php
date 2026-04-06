<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;

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
}
