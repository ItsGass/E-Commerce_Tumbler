<?php

use App\Models\Product;
use App\Models\ProductImage;
use Database\Seeders\DemoImageSeeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Copy the given committed demo photos into a throwaway directory.
 *
 * @param  list<string>  $files
 */
function demoAssetDirectory(array $files): string
{
    $directory = storage_path('framework/testing/demo-assets-'.Str::lower(Str::random(8)));

    File::ensureDirectoryExists($directory);

    foreach ($files as $file) {
        File::copy(database_path('seeders/demo-assets/'.$file), $directory.'/'.$file);
    }

    return $directory;
}

test('the demo image seeder copies three photos per product', function () {
    Storage::fake('public');
    Storage::disk('public')->put('products/images/classic-stainless-tumbler.png', 'legacy');

    $product = Product::factory()->create(['slug' => 'classic-stainless-tumbler']);

    $this->seed(DemoImageSeeder::class);

    $paths = [
        'products/images/classic-stainless-tumbler-1.jpg',
        'products/images/classic-stainless-tumbler-2.jpg',
        'products/images/classic-stainless-tumbler-3.jpg',
    ];

    $images = $product->fresh()->images;

    expect($images)->toHaveCount(3)
        ->and($images->pluck('path')->all())->toBe($paths)
        ->and($images->pluck('sort_order')->all())->toBe([0, 1, 2])
        ->and($images->where('is_thumbnail', true)->pluck('path')->all())->toBe([$paths[0]])
        ->and(Storage::disk('public')->exists('products/images/classic-stainless-tumbler.png'))->toBeFalse();

    foreach ($paths as $path) {
        expect(Storage::disk('public')->exists($path))->toBeTrue()
            ->and(substr(Storage::disk('public')->get($path), 0, 3))->toBe("\xFF\xD8\xFF");
    }
});

test('the demo image seeder seeds the photos that exist when some are missing', function () {
    Storage::fake('public');

    $directory = demoAssetDirectory([
        'classic-stainless-tumbler-2.jpg',
        'classic-stainless-tumbler-3.jpg',
    ]);

    try {
        config(['seed.demo_assets' => $directory]);

        $product = Product::factory()->create(['slug' => 'classic-stainless-tumbler']);

        $this->seed(DemoImageSeeder::class);

        $images = $product->fresh()->images;

        expect($images)->toHaveCount(2)
            ->and($images->pluck('path')->all())->toBe([
                'products/images/classic-stainless-tumbler-2.jpg',
                'products/images/classic-stainless-tumbler-3.jpg',
            ])
            ->and($images->pluck('sort_order')->all())->toBe([1, 2])
            ->and($images->where('is_thumbnail', true)->pluck('path')->all())->toBe([
                'products/images/classic-stainless-tumbler-2.jpg',
            ]);
    } finally {
        File::deleteDirectory($directory);
    }
});

test('the demo image seeder is idempotent', function () {
    Storage::fake('public');

    $product = Product::factory()->create(['slug' => 'classic-stainless-tumbler']);

    $this->seed(DemoImageSeeder::class);

    $paths = ProductImage::query()->orderBy('id')->pluck('path')->all();
    $rows = ProductImage::query()->orderBy('id')->get(['path', 'sort_order', 'is_thumbnail'])->toArray();
    $hashes = collect($paths)->mapWithKeys(
        fn (string $path): array => [$path => md5(Storage::disk('public')->get($path))]
    )->all();

    $this->seed(DemoImageSeeder::class);

    expect(ProductImage::count())->toBe(3)
        ->and(ProductImage::query()->orderBy('id')->get(['path', 'sort_order', 'is_thumbnail'])->toArray())->toBe($rows)
        ->and(collect($paths)->mapWithKeys(
            fn (string $path): array => [$path => md5(Storage::disk('public')->get($path))]
        )->all())->toBe($hashes)
        ->and(Storage::disk('public')->allFiles('products/images'))->toHaveCount(3)
        ->and($product->fresh()->thumbnail?->path)->toBe($paths[0]);
});

test('the demo image seeder replaces placeholder rows and deletes their files', function () {
    Storage::fake('public');

    $product = Product::factory()->create(['slug' => 'classic-stainless-tumbler']);

    $placeholderPath = 'products/placeholder-classic-stainless-tumbler.jpg';
    $legacyPath = 'products/images/classic-stainless-tumbler.png';

    Storage::disk('public')->put($placeholderPath, 'placeholder');
    Storage::disk('public')->put($legacyPath, 'legacy');

    ProductImage::create([
        'product_id' => $product->id,
        'path' => $placeholderPath,
        'sort_order' => 0,
        'is_thumbnail' => true,
    ]);

    ProductImage::create([
        'product_id' => $product->id,
        'path' => $legacyPath,
        'sort_order' => 0,
        'is_thumbnail' => false,
    ]);

    $this->seed(DemoImageSeeder::class);

    expect(ProductImage::count())->toBe(3)
        ->and(ProductImage::query()->where('path', $placeholderPath)->exists())->toBeFalse()
        ->and(ProductImage::query()->where('path', $legacyPath)->exists())->toBeFalse()
        ->and(Storage::disk('public')->exists($placeholderPath))->toBeFalse()
        ->and(Storage::disk('public')->exists($legacyPath))->toBeFalse()
        ->and($product->fresh()->thumbnail?->path)->toBe('products/images/classic-stainless-tumbler-1.jpg');
});

test('the demo image seeder falls back to a generated png when a product has no photos', function () {
    if (! extension_loaded('gd')) {
        $this->markTestSkipped('The GD extension is required to generate the fallback image.');
    }

    Storage::fake('public');

    $product = Product::factory()->create();

    $this->seed(DemoImageSeeder::class);

    $path = 'products/images/'.$product->slug.'.png';
    $images = $product->fresh()->images;

    expect($images)->toHaveCount(1)
        ->and($images->first()?->path)->toBe($path)
        ->and($images->first()?->is_thumbnail)->toBeTrue()
        ->and(Storage::disk('public')->exists($path))->toBeTrue()
        ->and(substr(Storage::disk('public')->get($path), 0, 8))->toBe("\x89PNG\r\n\x1a\n");
});
