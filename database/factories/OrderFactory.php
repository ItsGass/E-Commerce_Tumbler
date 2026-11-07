<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $isGuest = fake()->boolean(30);
        // `$user` is a factory, not a model: read its key only after Laravel
        // expands the nested factory (reading ->id here is undefined).
        $user = $isGuest ? null : User::factory();

        $subtotal = fake()->numberBetween(100000, 1000000);
        $shipping = $subtotal >= 500000 ? 0 : 15000;

        return [
            'code' => 'TS-'.Str::upper(Str::random(8)),
            'user_id' => $user,
            'status' => fake()->randomElement(OrderStatus::values()),
            'subtotal' => $subtotal,
            'shipping_cost' => $shipping,
            'total' => $subtotal + $shipping,
            'buyer_name' => fake()->name(),
            'buyer_email' => fake()->unique()->safeEmail(),
            'buyer_phone' => '08'.fake()->numerify('##########'),
            'buyer_street' => fake()->streetAddress(),
            'buyer_city' => fake()->city(),
            'buyer_province' => fake()->state(),
            'buyer_postal_code' => fake()->postcode(),
            'paid_at' => null,
            'shipped_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ];
    }
}
