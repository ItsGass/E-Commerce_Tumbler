<?php

use App\Models\Order;

function trackingOrder(array $attributes = []): Order
{
    return Order::factory()->create(array_merge([
        'user_id' => null,
        'code' => 'TS-TRACK001',
        'buyer_email' => 'track@example.com',
        'buyer_phone' => '081200000099',
    ], $attributes));
}

function trackUrl(string $code, array $query = []): string
{
    return '/api/orders/'.$code.'/track'.($query ? '?'.http_build_query($query) : '');
}

test('a guest can track an order with the code and email', function () {
    $order = trackingOrder();

    $this->getJson(trackUrl($order->code, ['email' => 'track@example.com']))
        ->assertOk()
        ->assertJsonPath('data.code', 'TS-TRACK001')
        ->assertJsonPath('data.buyer.email', 'track@example.com');
});

test('a guest can track an order with the code and phone', function () {
    $order = trackingOrder();

    $this->getJson(trackUrl($order->code, ['phone' => '081200000099']))
        ->assertOk()
        ->assertJsonPath('data.code', 'TS-TRACK001');
});

test('email or phone is enough when both are supplied', function () {
    $order = trackingOrder();

    // Correct phone, wrong email: the pair is matched with OR semantics.
    $this->getJson(trackUrl($order->code, [
        'email' => 'wrong@example.com',
        'phone' => '081200000099',
    ]))->assertOk()
        ->assertJsonPath('data.code', $order->code);

    // Correct email, wrong phone.
    $this->getJson(trackUrl($order->code, [
        'email' => 'track@example.com',
        'phone' => '089999999999',
    ]))->assertOk()
        ->assertJsonPath('data.code', $order->code);
});

dataset('mismatched tracking attempts', [
    'wrong email only' => [['email' => 'nope@example.com']],
    'wrong phone only' => [['phone' => '089999999999']],
    'both wrong' => [['email' => 'nope@example.com', 'phone' => '089999999999']],
]);

test('a mismatch returns the same generic 404', function (array $query) {
    $order = trackingOrder();

    $this->getJson(trackUrl($order->code, $query))
        ->assertNotFound()
        ->assertExactJson(['message' => 'Order not found']);
})->with('mismatched tracking attempts');

test('an unknown code returns the same generic 404 even with correct buyer data', function () {
    trackingOrder();

    $this->getJson(trackUrl('TS-DOESNOTEXIST', [
        'email' => 'track@example.com',
        'phone' => '081200000099',
    ]))->assertNotFound()
        ->assertExactJson(['message' => 'Order not found']);
});

test('tracking without email or phone is rejected', function () {
    $order = trackingOrder();

    $this->getJson(trackUrl($order->code))
        ->assertUnprocessable()
        ->assertExactJson(['message' => 'Email or phone is required']);
});

test('tracking is rate limited per client', function () {
    $order = trackingOrder();
    $url = trackUrl($order->code, ['email' => 'track@example.com']);

    for ($i = 0; $i < 20; $i++) {
        $this->getJson($url)->assertOk();
    }

    $this->getJson($url)->assertStatus(429);
});
