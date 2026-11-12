<?php

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Database\Seeders\ProductSeeder;

test('the product seeder creates a varied demo catalog', function () {
    $this->seed(ProductSeeder::class);

    $products = Product::query()->with('variants')->get();

    expect($products)->toHaveCount(12)
        ->and($products->pluck('slug')->unique())->toHaveCount(12)
        ->and($products->pluck('price')->min())->toBeGreaterThanOrEqual(149000)
        ->and($products->pluck('price')->max())->toBeLessThanOrEqual(489000)
        ->and($products->filter(fn (Product $product): bool => $product->stock > 0 && $product->stock < 5))->toHaveCount(1)
        ->and($products->contains(fn (Product $product): bool => $product->stock === 0))->toBeTrue();

    foreach ($products as $product) {
        expect($product->variants)->not->toBeEmpty()
            ->and($product->variants->where('is_default', true))->toHaveCount(1)
            ->and(substr_count((string) $product->description, "\n\n"))->toBeGreaterThanOrEqual(1)
            ->and($product->description)->toContain('Care:');

        foreach ($product->variants as $variant) {
            expect($variant->color_hex)->toMatch('/^#[0-9a-f]{6}$/i');
        }
    }
});

test('the product seeder is idempotent', function () {
    $this->seed(ProductSeeder::class);

    $counts = [
        Product::count(),
        ProductVariant::count(),
        ProductImage::count(),
    ];

    $this->seed(ProductSeeder::class);

    expect([
        Product::count(),
        ProductVariant::count(),
        ProductImage::count(),
    ])->toBe($counts);

    expect(Product::query()->where('slug', 'heritage-enamel-tumbler')->value('stock'))->toBe(0)
        ->and(Product::query()->where('slug', 'daily-brew-desk-mug')->value('stock'))->toBe(3);
});
