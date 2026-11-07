<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function transitionAdmin(): User
{
    $admin = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($admin);

    return $admin;
}

function transitionOrder(OrderStatus $status): Order
{
    return Order::factory()->create([
        'user_id' => null,
        'status' => $status,
    ]);
}

dataset('valid order transitions', [
    'pending -> paid' => [OrderStatus::Pending, 'paid'],
    'pending -> cancelled' => [OrderStatus::Pending, 'cancelled'],
    'paid -> processing' => [OrderStatus::Paid, 'processing'],
    'paid -> cancelled' => [OrderStatus::Paid, 'cancelled'],
    'processing -> shipped' => [OrderStatus::Processing, 'shipped'],
    'processing -> cancelled' => [OrderStatus::Processing, 'cancelled'],
    'shipped -> completed' => [OrderStatus::Shipped, 'completed'],
]);

dataset('invalid order transitions', [
    'pending -> shipped' => [OrderStatus::Pending, 'shipped'],
    'pending -> completed' => [OrderStatus::Pending, 'completed'],
    'pending -> processing' => [OrderStatus::Pending, 'processing'],
    'paid -> shipped' => [OrderStatus::Paid, 'shipped'],
    'paid -> completed' => [OrderStatus::Paid, 'completed'],
    'processing -> completed' => [OrderStatus::Processing, 'completed'],
    'shipped -> cancelled' => [OrderStatus::Shipped, 'cancelled'],
    'shipped -> paid' => [OrderStatus::Shipped, 'paid'],
    'completed -> cancelled' => [OrderStatus::Completed, 'cancelled'],
    'completed -> paid' => [OrderStatus::Completed, 'paid'],
    'cancelled -> paid' => [OrderStatus::Cancelled, 'paid'],
    'cancelled -> processing' => [OrderStatus::Cancelled, 'processing'],
    'same status' => [OrderStatus::Pending, 'pending'],
]);

test('an allowed transition is applied and stamps its timestamp', function (OrderStatus $from, string $to) {
    transitionAdmin();
    $order = transitionOrder($from);

    $response = $this->patchJson("/api/admin/orders/{$order->id}/status", [
        'status' => $to,
    ]);

    $response->assertOk();
    $response->assertJsonPath('data.status', $to);

    $order->refresh();
    expect($order->status->value)->toBe($to);

    match ($to) {
        'paid' => expect($order->paid_at)->not->toBeNull(),
        'shipped' => expect($order->shipped_at)->not->toBeNull(),
        'completed' => expect($order->completed_at)->not->toBeNull(),
        'cancelled' => expect($order->cancelled_at)->not->toBeNull(),
        default => null,
    };
})->with('valid order transitions');

test('a transition outside the map is rejected and the status is unchanged', function (OrderStatus $from, string $to) {
    transitionAdmin();
    $order = transitionOrder($from);

    $response = $this->patchJson("/api/admin/orders/{$order->id}/status", [
        'status' => $to,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('status');
    expect($order->refresh()->status)->toBe($from);
})->with('invalid order transitions');

test('marking a pending order as paid applies the transition', function () {
    transitionAdmin();
    $order = transitionOrder(OrderStatus::Pending);

    $this->postJson("/api/admin/orders/{$order->id}/mark-paid")
        ->assertOk()
        ->assertJsonPath('data.status', 'paid');

    expect($order->refresh()->paid_at)->not->toBeNull();
});

test('marking an already paid order reports that it is already paid', function () {
    transitionAdmin();
    $order = transitionOrder(OrderStatus::Paid);

    $this->postJson("/api/admin/orders/{$order->id}/mark-paid")
        ->assertOk()
        ->assertJsonPath('message', 'Order already marked as paid');

    expect($order->refresh()->status)->toBe(OrderStatus::Paid);
});

test('an order that cannot be paid is rejected by mark-paid', function () {
    transitionAdmin();
    $order = transitionOrder(OrderStatus::Cancelled);

    $this->postJson("/api/admin/orders/{$order->id}/mark-paid")
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Cannot mark as paid from current status');

    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled);
});
