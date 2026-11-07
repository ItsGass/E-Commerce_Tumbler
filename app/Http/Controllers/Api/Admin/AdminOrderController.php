<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()
            ->with(['items.product', 'items.variant', 'user'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('buyer_name', 'like', "%{$search}%")
                    ->orWhere('buyer_email', 'like', "%{$search}%");
            });
        }

        $perPage = min($request->integer('per_page', 20), 50);
        $orders = $query->paginate($perPage)->withQueryString();

        return new OrderCollection($orders);
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load('items.product', 'items.variant', 'user'));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, CheckoutService $checkoutService)
    {
        $newStatus = $request->validated('status');

        // Check if transition is allowed (already validated by FormRequest)
        if (! $order->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => 'Invalid status transition',
            ], 422);
        }

        // Handle stock restoration on cancellation
        if ($newStatus === 'cancelled' && $order->restoresStockOnCancel()) {
            try {
                $checkoutService->cancelOrder($order, $request->input('reason', 'Cancelled by admin'));
            } catch (\Exception $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 422);
            }
        }

        // Handle timestamps
        $updateData = ['status' => $newStatus];
        match ($newStatus) {
            'paid' => $updateData['paid_at'] = now(),
            'shipped' => $updateData['shipped_at'] = now(),
            'completed' => $updateData['completed_at'] = now(),
            'cancelled' => $updateData['cancelled_at'] = now(),
            default => null,
        };

        $order->update($updateData);

        return new OrderResource($order->load('items.product', 'items.variant'));
    }

    public function markPaid(Order $order)
    {
        if ($order->status === OrderStatus::Paid) {
            return response()->json(['message' => 'Order already marked as paid']);
        }

        if (! $order->canTransitionTo('paid')) {
            return response()->json([
                'message' => 'Cannot mark as paid from current status',
            ], 422);
        }

        $order->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return new OrderResource($order->load('items.product', 'items.variant'));
    }
}
