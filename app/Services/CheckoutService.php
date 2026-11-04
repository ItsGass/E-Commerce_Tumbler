<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class CheckoutService
{
    public function calculateTotals(array $items): array
    {
        $productIds = array_column($items, 'product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $subtotal = 0;
        foreach ($items as $item) {
            $product = $products[$item['product_id']] ?? null;
            if (! $product) {
                throw new \Exception("Product not found: {$item['product_id']}");
            }
            $unitPrice = $product->price;
            $subtotal += $unitPrice * $item['quantity'];
        }

        $shipping = $subtotal >= 500000 ? 0 : 15000;

        return [
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $subtotal + $shipping,
        ];
    }

    public function generateOrderCode(): string
    {
        $charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes 0, O, 1, I
        $code = 'TS-';
        for ($i = 0; $i < 8; $i++) {
            $code .= $charset[random_int(0, strlen($charset) - 1)];
        }

        return $code;
    }

    public function createOrder(array $data): Order
    {
        $items = $data['items'];
        $buyer = $data['buyer'] ?? [];
        $userId = $data['user_id'] ?? null;

        $totals = $this->calculateTotals($items);
        $code = $this->generateOrderCode();

        // Retry on collision (max 3 attempts)
        $attempts = 0;
        while (Order::where('code', $code)->exists() && $attempts < 3) {
            $code = $this->generateOrderCode();
            $attempts++;
        }

        return \DB::transaction(function () use ($items, $buyer, $userId, $totals, $code) {
            $productIds = array_column($items, 'product_id');
            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Verify stock
            foreach ($items as $item) {
                $product = $products[$item['product_id']] ?? null;
                if (! $product) {
                    throw new \Exception("Product not found: {$item['product_id']}");
                }
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$product->name}");
                }
            }

            // Create order
            $order = Order::create([
                'code' => $code,
                'user_id' => $userId,
                'status' => OrderStatus::Pending,
                'subtotal' => $totals['subtotal'],
                'shipping_cost' => $totals['shipping'],
                'total' => $totals['total'],
                'buyer_name' => $buyer['name'],
                'buyer_email' => $buyer['email'],
                'buyer_phone' => $buyer['phone'],
                'buyer_street' => $buyer['street'],
                'buyer_city' => $buyer['city'],
                'buyer_province' => $buyer['province'],
                'buyer_postal_code' => $buyer['postal_code'],
            ]);

            // Create order items and decrement stock
            foreach ($items as $item) {
                $product = $products[$item['product_id']];
                $variantId = $item['variant_id'] ?? null;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'variant_id' => $variantId,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'line_total' => $product->price * $item['quantity'],
                ]);

                $product->decrement('stock', $item['quantity']);
            }

            return $order->load('items.product', 'items.variant');
        });
    }

    public function cancelOrder(Order $order, string $reason): void
    {
        if (! $order->restoresStockOnCancel()) {
            throw new \Exception('Cannot cancel order in current status');
        }

        \DB::transaction(function () use ($order, $reason) {
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $order->update([
                'status' => OrderStatus::Cancelled,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
            ]);
        });
    }
}
