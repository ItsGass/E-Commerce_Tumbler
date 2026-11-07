<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoImageSeeder extends Seeder
{
    /**
     * Width and height of the generated PNG, in pixels.
     */
    private const IMAGE_SIZE = 600;

    /**
     * Background colours for products that have no default variant.
     */
    private const FALLBACK_COLORS = ['#2f6f6b', '#7a4f2b', '#3f4d8a', '#6b3f6f', '#4f6b2f'];

    /**
     * Generate a small placeholder image per product and point the product's
     * thumbnail at it.
     *
     * The seeder is opt-in: `DatabaseSeeder` only calls it when
     * `SEED_DEMO_IMAGES=true`, and it can also be run on its own with
     * `php artisan db:seed --class=DemoImageSeeder`.
     */
    public function run(): void
    {
        if (! extension_loaded('gd')) {
            throw new \RuntimeException('The GD extension is required to generate demo product images.');
        }

        $disk = Storage::disk('public');

        Product::query()->orderBy('id')->each(function (Product $product) use ($disk): void {
            $path = 'products/images/'.$product->slug.'.png';

            if (! $disk->exists($path)) {
                $disk->put($path, $this->placeholderPng($product));
            }

            $images = $product->images()->orderBy('sort_order')->orderBy('id')->get();

            if ($images->isEmpty()) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $path,
                    'sort_order' => 0,
                    'is_thumbnail' => true,
                ]);

                return;
            }

            // Keep every row pointing at a file that really exists.
            foreach ($images as $image) {
                if (! $disk->exists($image->path)) {
                    $image->update(['path' => $path]);
                }
            }

            if (! $images->contains(fn (ProductImage $image): bool => (bool) $image->is_thumbnail)) {
                $images->first()->update(['is_thumbnail' => true]);
            }
        });
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
        imagedestroy($canvas);

        ob_start();
        imagepng($image, null, 6);
        $png = (string) ob_get_clean();
        imagedestroy($image);

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
