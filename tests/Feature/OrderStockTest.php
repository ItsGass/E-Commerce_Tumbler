<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function stockAdmin(): User
{
    $admin = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($admin);

    return $admin;
}

function stockOrder(array $attributes = []): Order
{
    return Order::factory()->create(array_merge([
        'user_id' => null,
        'status' => OrderStatus::Pending,
    ], $attributes));
}

function stockItem(Order $order, Product $product, int $quantity): void
{
    $order->items()->create([
        'product_id' => $product->id,
        'variant_id' => null,
        'product_name' => $product->name,
        'unit_price' => $product->price,
        'quantity' => $quantity,
        'line_total' => $product->price * $quantity,
    ]);
}

function guestBuyer(): array
{
    return [
        'name' => 'Stock Buyer',
        'email' => 'stock@example.com',
        'phone' => '081200000010',
        'street' => 'Jl. Stock No. 1',
        'city' => 'Jakarta',
        'province' => 'DKI Jakarta',
        'postal_code' => '10110',
    ];
}

test('checkout decrements stock for every ordered quantity', function () {
    $product = Product::factory()->create(['price' => 100000, 'stock' => 5]);

    $this->postJson('/api/checkout/guest', [
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'buyer' => guestBuyer(),
    ])->assertCreated();

    expect($product->refresh()->stock)->toBe(3)
        ->and(Order::sole()->items()->sole()->quantity)->toBe(2);
});

test('an oversell is rejected and no order or stock change is written', function () {
    $product = Product::factory()->create(['stock' => 1]);

    $response = $this->postJson('/api/checkout/guest', [
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'buyer' => guestBuyer(),
    ]);

    $response->assertUnprocessable();
    $response->assertJsonPath('message', "Insufficient stock for {$product->name}");

    expect(Order::count())->toBe(0)
        ->and($product->refresh()->stock)->toBe(1);
});

test('a failed multi-item checkout rolls back the stock of earlier items', function () {
    $available = Product::factory()->create(['stock' => 10]);
    $scarce = Product::factory()->create(['stock' => 1]);

    $response = $this->postJson('/api/checkout/guest', [
        'items' => [
            ['product_id' => $available->id, 'quantity' => 3],
            ['product_id' => $scarce->id, 'quantity' => 5],
        ],
        'buyer' => guestBuyer(),
    ]);

    $response->assertUnprocessable();

    // The first item is decremented before the second one fails; the
    // transaction must roll that decrement back.
    expect($available->refresh()->stock)->toBe(10)
        ->and($scarce->refresh()->stock)->toBe(1)
        ->and(Order::count())->toBe(0)
        ->and(OrderItem::count())->toBe(0);
});

test('cancelling restores stock from pending, paid and processing', function () {
    stockAdmin();

    foreach ([OrderStatus::Pending, OrderStatus::Paid, OrderStatus::Processing] as $status) {
        $product = Product::factory()->create(['stock' => 10]);
        $order = stockOrder(['status' => $status]);
        stockItem($order, $product, 3);

        // State after checkout: three units are already reserved.
        $product->decrement('stock', 3);

        $this->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'cancelled',
            'reason' => 'customer request',
        ])->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        expect($product->refresh()->stock)->toBe(10)
            ->and($order->refresh()->status)->toBe(OrderStatus::Cancelled)
            ->and($order->cancelled_at)->not->toBeNull()
            ->and($order->cancellation_reason)->toBe('customer request');
    }
});

test('shipped and completed orders cannot be cancelled and keep their stock reserved', function () {
    stockAdmin();

    foreach ([OrderStatus::Shipped, OrderStatus::Completed] as $status) {
        $product = Product::factory()->create(['stock' => 10]);
        $order = stockOrder(['status' => $status]);
        stockItem($order, $product, 3);
        $product->decrement('stock', 3);

        $this->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'cancelled',
        ])->assertUnprocessable();

        expect($product->refresh()->stock)->toBe(7)
            ->and($order->refresh()->status)->toBe($status);
    }
});

test('cancelling twice does not restore stock twice', function () {
    stockAdmin();

    $product = Product::factory()->create(['stock' => 10]);
    $order = stockOrder();
    stockItem($order, $product, 4);
    $product->decrement('stock', 4);

    $this->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
        ->assertOk();
    expect($product->refresh()->stock)->toBe(10);

    $this->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
        ->assertUnprocessable();

    expect($product->refresh()->stock)->toBe(10)
        ->and($order->refresh()->status)->toBe(OrderStatus::Cancelled);
});
