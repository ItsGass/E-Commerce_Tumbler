<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => fake()->unique()->colorName(),
            'color_hex' => '#'.fake()->hexColor(),
            'texture_path' => null,
            'glb_path' => null,
            'sort_order' => fake()->numberBetween(0, 10),
            'is_default' => false,
        ];
    }
}
