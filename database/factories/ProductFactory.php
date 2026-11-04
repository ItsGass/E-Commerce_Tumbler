<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'description' => fake()->paragraph(3),
            'price' => fake()->numberBetween(100000, 500000),
            'stock' => fake()->numberBetween(0, 100),
            'glb_path' => null,
            'glb_original_name' => null,
            'is_active' => true,
        ];
    }
}
