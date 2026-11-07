<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function buyerPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Guest Buyer',
        'email' => 'guest@example.com',
        'phone' => '081200000001',
        'street' => 'Jl. Guest No. 1',
        'city' => 'Jakarta',
        'province' => 'DKI Jakarta',
        'postal_code' => '10110',
    ], $overrides);
}

test('guest checkout snapshots buyer and item data and ignores client prices', function () {
    $product = Product::factory()->create([
        'name' => 'Snapshot Tumbler',
        'price' => 200000,
        'stock' => 10,
    ]);

    $response = $this->postJson('/api/checkout/guest', [
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            // Client-supplied prices must be ignored.
            'price' => 1,
            'unit_price' => 1,
            'line_total' => 2,
        ]],
        'buyer' => buyerPayload(),
        'total' => 2,
    ]);

    $response->assertCreated();
    $response->assertJsonPath('data.subtotal', 400000);
    $response->assertJsonPath('data.shipping_cost', 15000);
    $response->assertJsonPath('data.total', 415000);
    $response->assertJsonPath('data.buyer.name', 'Guest Buyer');
    $response->assertJsonPath('data.buyer.email', 'guest@example.com');
    $response->assertJsonPath('data.items.0.product_name', 'Snapshot Tumbler');
    $response->assertJsonPath('data.items.0.unit_price', 200000);
    $response->assertJsonPath('data.items.0.line_total', 400000);

    expect($product->refresh()->stock)->toBe(8);

    $order = Order::sole();

    // Later catalog changes must not rewrite the order snapshot.
    $product->update(['name' => 'Renamed Tumbler', 'price' => 999999]);

    expect($order->fresh()->buyer_name)->toBe('Guest Buyer')
        ->and($order->fresh()->total)->toBe(415000)
        ->and($order->items()->sole()->product_name)->toBe('Snapshot Tumbler')
        ->and($order->items()->sole()->unit_price)->toBe(200000);
});

test('guest checkout charges no shipping from 500000 subtotal', function () {
    $product = Product::factory()->create(['price' => 250000, 'stock' => 10]);

    $response = $this->postJson('/api/checkout/guest', [
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'buyer' => buyerPayload(),
    ]);

    $response->assertCreated();
    $response->assertJsonPath('data.subtotal', 500000);
    $response->assertJsonPath('data.shipping_cost', 0);
    $response->assertJsonPath('data.total', 500000);
});

test('a complete logged-in user can check out and the buyer snapshot comes from the profile', function () {
    $user = User::factory()->create([
        'name' => 'Profile Buyer',
        'email' => 'profile@example.com',
        'phone' => '081200000002',
        'street' => 'Jl. Profile No. 2',
        'city' => 'Bandung',
        'province' => 'Jawa Barat',
        'postal_code' => '40111',
    ]);
    $product = Product::factory()->create(['price' => 100000, 'stock' => 5]);
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/checkout/user', [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'buyer' => buyerPayload(['name' => 'Ignored Client Name']),
    ]);

    $response->assertCreated();
    $response->assertJsonPath('data.buyer.name', 'Profile Buyer');
    $response->assertJsonPath('data.buyer.email', 'profile@example.com');
    $response->assertJsonPath('data.buyer.street', 'Jl. Profile No. 2');
    // OrderResource only exposes user_id to admins, so assert the column.
    $response->assertJsonMissingPath('data.user_id');

    expect(Order::sole()->user_id)->toBe($user->id);
});

test('an incomplete profile blocks logged-in checkout', function () {
    $user = User::factory()->create(); // no phone/address fields
    $product = Product::factory()->create(['stock' => 5]);
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/checkout/user', [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('profile');

    expect(Order::count())->toBe(0)
        ->and($product->refresh()->stock)->toBe(5);
});

test('guest checkout still requires the buyer block', function () {
    $product = Product::factory()->create(['stock' => 5]);

    $response = $this->postJson('/api/checkout/guest', [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('buyer');

    expect(Order::count())->toBe(0)
        ->and($product->refresh()->stock)->toBe(5);
});
