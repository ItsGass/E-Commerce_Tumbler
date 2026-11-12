<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoImageSeeder extends Seeder
{
    /**
     * Width and height of the generated fallback PNG, in pixels.
     */
    private const IMAGE_SIZE = 600;

    /**
     * Photo numbers that make up a demo product's gallery.
     *
     * @var list<int>
     */
    private const PHOTO_INDEXES = [1, 2, 3];

    /**
     * Background colours for products that have no default variant.
     */
    private const FALLBACK_COLORS = ['#2f6f6b', '#7a4f2b', '#3f4d8a', '#6b3f6f', '#4f6b2f'];

    /**
     * Copy the optimized demo photos onto the public disk and point three
     * image rows per product at them.
     *
     * The seeder is opt-in: `DatabaseSeeder` only calls it when
     * `SEED_DEMO_IMAGES=true`, and it can also be run on its own with
     * `php artisan db:seed --class=DemoImageSeeder`.
     *
     * A product with no optimized photos falls back to a generated solid
     * colour PNG. A missing or unreadable photo never aborts the seed.
     */
    public function run(): void
    {
        $disk = Storage::disk('public');
        $sourceDirectory = (string) config('seed.demo_assets');

        Product::query()->orderBy('id')->each(function (Product $product) use ($disk, $sourceDirectory): void {
            $photos = $this->photoFiles($sourceDirectory, $product->slug);

            if ($photos === []) {
                $this->seedPlaceholder($product, $disk);

                return;
            }

            $this->seedPhotos($product, $photos, $disk);
        });
    }

    /**
     * The optimized photos that exist for a product, keyed by photo number.
     *
     * @return array<int, string>
     */
    private function photoFiles(string $directory, string $slug): array
    {
        $photos = [];

        foreach (self::PHOTO_INDEXES as $index) {
            $path = $directory.DIRECTORY_SEPARATOR.$slug.'-'.$index.'.jpg';

            if (is_file($path)) {
                $photos[$index] = $path;
            }
        }

        return $photos;
    }

    /**
     * @param  array<int, string>  $photos
     */
    private function seedPhotos(Product $product, array $photos, Filesystem $disk): void
    {
        $paths = [];

        foreach ($photos as $index => $source) {
            $path = $this->photoPath($product, $index);
            $contents = @file_get_contents($source);

            if ($contents === false) {
                // Keep an already seeded copy when the source became unreadable.
                if ($disk->exists($path)) {
                    $paths[$index] = $path;
                }

                continue;
            }

            if (! $disk->exists($path) || $disk->get($path) !== $contents) {
                $disk->put($path, $contents);
            }

            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'path' => $path],
                ['sort_order' => $index - 1, 'is_thumbnail' => false],
            );

            $paths[$index] = $path;
        }

        if ($paths === []) {
            $this->seedPlaceholder($product, $disk);

            return;
        }

        $this->removeStaleDemoImages($product, array_values($paths), $disk);
        $this->deleteLegacyDemoFiles($product, array_values($paths), $disk);
        $this->ensureThumbnail($product, $paths[array_key_first($paths)]);
    }

    /**
     * Generate the placeholder PNG used when a product has no photos.
     */
    private function seedPlaceholder(Product $product, Filesystem $disk): void
    {
        $path = 'products/images/'.$product->slug.'.png';

        if (extension_loaded('gd') && ! $disk->exists($path)) {
            $disk->put($path, $this->placeholderPng($product));
        }

        $this->removeStaleDemoImages($product, [$path], $disk);
        $this->deleteLegacyDemoFiles($product, [$path], $disk);

        ProductImage::updateOrCreate(
            ['product_id' => $product->id, 'path' => $path],
            ['sort_order' => 0, 'is_thumbnail' => true],
        );

        ProductImage::query()
            ->where('product_id', $product->id)
            ->where('is_thumbnail', true)
            ->where('path', '!=', $path)
            ->update(['is_thumbnail' => false]);
    }

    /**
     * Drop demo rows and files that the current photo set no longer uses.
     * Rows pointing at anything else (for example an admin upload) are kept.
     *
     * @param  list<string>  $keepPaths
     */
    private function removeStaleDemoImages(Product $product, array $keepPaths, Filesystem $disk): void
    {
        ProductImage::query()
            ->where('product_id', $product->id)
            ->get()
            ->each(function (ProductImage $image) use ($product, $keepPaths, $disk): void {
                if (in_array($image->path, $keepPaths, true)) {
                    return;
                }

                if (! $this->isDemoPath($product->slug, $image->path)) {
                    return;
                }

                if ($disk->exists($image->path)) {
                    $disk->delete($image->path);
                }

                $image->delete();
            });
    }

    private function ensureThumbnail(Product $product, string $path): void
    {
        ProductImage::query()
            ->where('product_id', $product->id)
            ->where('is_thumbnail', true)
            ->where('path', '!=', $path)
            ->update(['is_thumbnail' => false]);

        ProductImage::query()
            ->where('product_id', $product->id)
            ->where('path', $path)
            ->update(['is_thumbnail' => true]);
    }

    private function photoPath(Product $product, int $index): string
    {
        return 'products/images/'.$product->slug.'-'.$index.'.jpg';
    }

    /**
     * Delete leftover files from earlier seeder versions even when the
     * database was reset and no row points at them anymore.
     *
     * @param  list<string>  $keepPaths
     */
    private function deleteLegacyDemoFiles(Product $product, array $keepPaths, Filesystem $disk): void
    {
        foreach ($this->legacyPaths($product->slug) as $path) {
            if (in_array($path, $keepPaths, true)) {
                continue;
            }

            if ($disk->exists($path)) {
                $disk->delete($path);
            }
        }
    }

    /**
     * Paths used by earlier versions of this seeder.
     *
     * @return list<string>
     */
    private function legacyPaths(string $slug): array
    {
        return [
            'products/images/'.$slug.'.png',
            'products/placeholder-'.$slug.'.jpg',
        ];
    }

    /**
     * Whether a path is one this seeder may replace or delete.
     */
    private function isDemoPath(string $slug, string $path): bool
    {
        if (in_array($path, $this->legacyPaths($slug), true)) {
            return true;
        }

        return (bool) preg_match(
            '#^products/images/'.preg_quote($slug, '#').'-[1-9][0-9]*\.jpg$#',
            $path,
        );
    }

    /**
     * Render a solid colour PNG with a simple tumbler silhouette.
     */
    private function placeholderPng(Product $product): string
    {
        $size = self::IMAGE_SIZE;
        $scale = 2;
        $canvas = imagecreatetruecolor($size * $scale, $size * $scale);

        [$red, $green, $blue] = $this->hexToRgb($this->backgroundColor($product));
        [$shapeRed, $shapeGreen, $shapeBlue] = $this->blend([$red, $green, $blue], [255, 255, 255], 0.86);

        $background = imagecolorallocate($canvas, $red, $green, $blue);
        $shape = imagecolorallocate($canvas, $shapeRed, $shapeGreen, $shapeBlue);

        imagefilledrectangle($canvas, 0, 0, $size * $scale, $size * $scale, $background);

        // Straw.
        imagefilledrectangle($canvas, 575, 140, 625, 300, $shape);
        // Lid.
        imagefilledellipse($canvas, 600, 300, 460, 110, $shape);
        imagefilledrectangle($canvas, 370, 300, 830, 350, $shape);
        // Body.
        imagefilledellipse($canvas, 600, 360, 420, 80, $shape);
        imagefilledrectangle($canvas, 390, 360, 810, 1000, $shape);
        imagefilledellipse($canvas, 600, 1000, 420, 100, $shape);

        // Downscale for smooth edges.
        $image = imagecreatetruecolor($size, $size);
        imagecopyresampled($image, $canvas, 0, 0, 0, 0, $size, $size, $size * $scale, $size * $scale);

        ob_start();
        imagepng($image, null, 6);
        $png = (string) ob_get_clean();

        return $png;
    }

    /**
     * The default variant colour, or a stable fallback colour.
     */
    private function backgroundColor(Product $product): string
    {
        $variant = $product->defaultVariant;

        if ($variant && $variant->color_hex) {
            return $variant->color_hex;
        }

        return self::FALLBACK_COLORS[$product->id % count(self::FALLBACK_COLORS)];
    }

    /**
     * @return array{int, int, int}
     */
    private function hexToRgb(string $hex): array
    {
        $hex = ltrim(trim($hex), '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        if (! preg_match('/^[0-9a-fA-F]{6}$/', $hex)) {
            $hex = '2f6f6b';
        }

        return [
            (int) hexdec(substr($hex, 0, 2)),
            (int) hexdec(substr($hex, 2, 2)),
            (int) hexdec(substr($hex, 4, 2)),
        ];
    }

    /**
     * Blend an overlay colour over a base colour.
     *
     * @param  array{int, int, int}  $base
     * @param  array{int, int, int}  $overlay
     * @return array{int, int, int}
     */
    private function blend(array $base, array $overlay, float $weight): array
    {
        return [
            (int) round($base[0] + ($overlay[0] - $base[0]) * $weight),
            (int) round($base[1] + ($overlay[1] - $base[1]) * $weight),
            (int) round($base[2] + ($overlay[2] - $base[2]) * $weight),
        ];
    }
}
