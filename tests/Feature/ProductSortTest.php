<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Carbon;

/**
 * Create a product with a deterministic timestamp. `created_at` is not
 * fillable, so it is forced after the factory insert.
 */
function createProductAt(string $name, Carbon $createdAt): Product
{
    $product = Product::factory()->create(['name' => $name]);

    $product->forceFill(['created_at' => $createdAt])->save();

    return $product;
}

/**
 * Record one order line for a product. The order status decides whether the
 * units count towards "popular".
 */
function recordSale(Product $product, int $quantity, OrderStatus $status): void
{
    $order = Order::factory()->create(['status' => $status]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'variant_id' => null,
        'product_name' => $product->name,
        'unit_price' => $product->price,
        'quantity' => $quantity,
        'line_total' => $product->price * $quantity,
    ]);
}

it('returns the newest products first for sort=new', function () {
    $oldest = createProductAt('Oldest Tumbler', Carbon::parse('2026-01-01 10:00:00'));
    $middle = createProductAt('Middle Tumbler', Carbon::parse('2026-02-01 10:00:00'));
    $newest = createProductAt('Newest Tumbler', Carbon::parse('2026-03-01 10:00:00'));

    $response = $this->getJson('/api/products?sort=new');

    $response->assertOk();
    expect(collect($response->json('data'))->pluck('id')->all())
        ->toBe([$newest->id, $middle->id, $oldest->id]);
});

it('falls back to newest products when sort is absent', function () {
    $oldest = createProductAt('Oldest Tumbler', Carbon::parse('2026-01-01 10:00:00'));
    $newest = createProductAt('Newest Tumbler', Carbon::parse('2026-03-01 10:00:00'));

    $response = $this->getJson('/api/products');

    $response->assertOk();
    expect(collect($response->json('data'))->pluck('id')->all())
        ->toBe([$newest->id, $oldest->id]);
});

it('orders popular products by units sold and ignores cancelled orders', function () {
    $oldest = createProductAt('Oldest Tumbler', Carbon::parse('2026-01-01 10:00:00'));
    $middle = createProductAt('Middle Tumbler', Carbon::parse('2026-02-01 10:00:00'));
    $newest = createProductAt('Newest Tumbler', Carbon::parse('2026-03-01 10:00:00'));

    // Two units each: the newer product wins the tie-break.
    recordSale($oldest, 2, OrderStatus::Completed);
    recordSale($middle, 2, OrderStatus::Paid);

    // Lots of cancelled units must not promote the newest product.
    recordSale($newest, 9, OrderStatus::Cancelled);

    $response = $this->getJson('/api/products?sort=popular');

    $response->assertOk();
    expect(collect($response->json('data'))->pluck('id')->all())
        ->toBe([$middle->id, $oldest->id, $newest->id]);
});

it('does not expose the units sold helper on the product resource', function () {
    $product = createProductAt('Tumbler', Carbon::parse('2026-01-01 10:00:00'));
    recordSale($product, 3, OrderStatus::Completed);

    $response = $this->getJson('/api/products?sort=popular');

    $response->assertOk();
    expect($response->json('data.0'))->not->toHaveKey('units_sold');
});
