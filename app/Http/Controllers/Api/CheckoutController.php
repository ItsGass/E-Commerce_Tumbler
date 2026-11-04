<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Checkout\GuestCheckoutRequest;
use App\Http\Requests\Api\Checkout\UserCheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutService;

class CheckoutController extends Controller
{
    public function guest(GuestCheckoutRequest $request, CheckoutService $checkoutService)
    {
        $validated = $request->validated();

        try {
            $order = $checkoutService->createOrder([
                'items' => $validated['items'],
                'buyer' => $validated['buyer'],
                'user_id' => null,
            ]);

            return (new OrderResource($order))
                ->additional(['message' => 'Order created successfully'])
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function user(UserCheckoutRequest $request, CheckoutService $checkoutService)
    {
        $user = $request->user();

        // Double-check profile completeness
        if (! $user->profile_complete) {
            return response()->json([
                'message' => 'Profile incomplete. Please complete your profile before checkout.',
            ], 422);
        }

        $validated = $request->validated();

        try {
            $order = $checkoutService->createOrder([
                'items' => $validated['items'],
                'buyer' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'street' => $user->street,
                    'city' => $user->city,
                    'province' => $user->province,
                    'postal_code' => $user->postal_code,
                ],
                'user_id' => $user->id,
            ]);

            return (new OrderResource($order))
                ->additional(['message' => 'Order created successfully'])
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
