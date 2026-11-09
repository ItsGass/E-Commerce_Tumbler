<?php

use App\Models\Product;
use App\Models\ProductImage;
use Database\Seeders\DemoImageSeeder;
use Illuminate\Support\Facades\Storage;

test('the demo image seeder writes png thumbnails and is idempotent', function () {
    if (! extension_loaded('gd')) {
        $this->markTestSkipped('The GD extension is required to generate demo images.');
    }

    Storage::fake('public');

    $products = Product::factory()->count(2)->create();

    $this->seed(DemoImageSeeder::class);

    $paths = [];

    foreach ($products as $product) {
        $path = 'products/images/'.$product->slug.'.png';
        $paths[] = $path;

        expect(Storage::disk('public')->exists($path))->toBeTrue();

        $png = Storage::disk('public')->get($path);
        expect(substr($png, 0, 8))->toBe("\x89PNG\r\n\x1a\n");

        $thumbnail = $product->fresh()->thumbnail;
        expect($thumbnail)->not->toBeNull()
            ->and($thumbnail->path)->toBe($path)
            ->and($thumbnail->is_thumbnail)->toBeTrue();
    }

    // Every image row the seeder leaves behind must point at a real file.
    foreach (ProductImage::all() as $image) {
        expect(Storage::disk('public')->exists($image->path))->toBeTrue();
    }

    $imageCount = ProductImage::count();
    $hashes = collect($paths)->mapWithKeys(
        fn (string $path): array => [$path => md5(Storage::disk('public')->get($path))]
    );

    $this->seed(DemoImageSeeder::class);

    expect(ProductImage::count())->toBe($imageCount)
        ->and(collect($paths)->mapWithKeys(
            fn (string $path): array => [$path => md5(Storage::disk('public')->get($path))]
        )->all())->toBe($hashes->all());

    foreach ($products as $product) {
        expect($product->images()->count())->toBe(1);
    }
});
