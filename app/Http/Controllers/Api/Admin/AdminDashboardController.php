<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class AdminDashboardController extends Controller
{
    /**
     * Aggregates for the admin dashboard.
     *
     * The page reads this payload directly (it is not a paginated list), so
     * the response is a flat object instead of the `{ data, meta }` envelope
     * used by the collection endpoints.
     */
    public function index()
    {
        $recentOrders = Order::query()
            ->latest()
            ->limit(5)
            ->get(['id', 'code', 'status', 'total', 'buyer_name', 'created_at']);

        $lowStockProducts = Product::query()
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->limit(5)
            ->get(['id', 'name', 'stock', 'price']);

        return response()->json([
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_users' => User::count(),
            // Revenue only counts orders whose (mock) payment went through and
            // that were not cancelled afterwards.
            'total_revenue' => (int) Order::query()
                ->whereIn('status', [
                    OrderStatus::Paid->value,
                    OrderStatus::Processing->value,
                    OrderStatus::Shipped->value,
                    OrderStatus::Completed->value,
                ])
                ->sum('total'),
            'recent_orders' => $recentOrders->map(fn (Order $order) => [
                'id' => $order->id,
                'code' => $order->code,
                'status' => $order->status->value,
                'total' => $order->total,
                'created_at' => $order->created_at?->toISOString(),
                'buyer_name' => $order->buyer_name,
            ]),
            'low_stock_products' => $lowStockProducts->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'stock' => $product->stock,
                'price' => $product->price,
            ]),
        ]);
    }
}
