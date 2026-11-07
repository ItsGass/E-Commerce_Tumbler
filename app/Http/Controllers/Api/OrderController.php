<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function track(Request $request, string $code)
    {
        $email = $request->query('email');
        $phone = $request->query('phone');

        if (! $email && ! $phone) {
            return response()->json([
                'message' => 'Email or phone is required',
            ], 422);
        }

        $query = Order::query()->where('code', $code);

        // The buyer can prove ownership with either identifier. Group them so
        // a wrong email does not hide a matching phone (the old if/elseif
        // checked only the email when both were present).
        $query->where(function ($query) use ($email, $phone) {
            if ($email) {
                $query->orWhere('buyer_email', $email);
            }

            if ($phone) {
                $query->orWhere('buyer_phone', $phone);
            }
        });

        $order = $query->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order not found',
            ], 404);
        }

        return new OrderResource($order->load('items.product', 'items.variant'));
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items.product', 'items.variant'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return new OrderCollection($orders);
    }

    public function show(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        return new OrderResource($order->load('items.product', 'items.variant'));
    }
}
