<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Classic Stainless Tumbler',
                'slug' => 'classic-stainless-tumbler',
                'description' => 'Premium 500ml stainless steel tumbler with double-wall vacuum insulation. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid.',
                'price' => 185000,
                'stock' => 50,
                'is_active' => true,
                'variants' => [
                    ['name' => 'Matte Black', 'color_hex' => '#1a1a1a', 'is_default' => true],
                    ['name' => 'Brushed Silver', 'color_hex' => '#c0c0c0', 'is_default' => false],
                    ['name' => 'Navy Blue', 'color_hex' => '#1e3a5f', 'is_default' => false],
                    ['name' => 'Forest Green', 'color_hex' => '#2d5016', 'is_default' => false],
                ],
            ],
            [
                'name' => 'Ceramic Coated Travel Mug',
                'slug' => 'ceramic-coated-travel-mug',
                'description' => '350ml ceramic-coated interior for pure taste without metallic aftertaste. Ergonomic design with non-slip base. Perfect for coffee lovers.',
                'price' => 220000,
                'stock' => 35,
                'is_active' => true,
                'variants' => [
                    ['name' => 'Pearl White', 'color_hex' => '#fafafa', 'is_default' => true],
                    ['name' => 'Charcoal Grey', 'color_hex' => '#36454f', 'is_default' => false],
                    ['name' => 'Blush Pink', 'color_hex' => '#de5d83', 'is_default' => false],
                ],
            ],
            [
                'name' => 'Insulated Sports Bottle',
                'slug' => 'insulated-sports-bottle',
                'description' => '750ml large capacity sports bottle with straw lid and carry handle. Wide mouth for ice cubes. Dishwasher safe.',
                'price' => 155000,
                'stock' => 80,
                'is_active' => true,
                'variants' => [
                    ['name' => 'Electric Blue', 'color_hex' => '#007bff', 'is_default' => true],
                    ['name' => 'Neon Green', 'color_hex' => '#39ff14', 'is_default' => false],
                    ['name' => 'Hot Pink', 'color_hex' => '#ff69b4', 'is_default' => false],
                    ['name' => 'Vibrant Orange', 'color_hex' => '#ff8c00', 'is_default' => false],
                ],
            ],
            [
                'name' => 'Minimalist Glass Tumbler',
                'slug' => 'minimalist-glass-tumbler',
                'description' => '400ml borosilicate glass tumbler with silicone sleeve for grip and protection. Pure glass taste, no flavor retention. Microwave safe without lid.',
                'price' => 135000,
                'stock' => 60,
                'is_active' => true,
                'variants' => [
                    ['name' => 'Clear + Grey Sleeve', 'color_hex' => '#808080', 'is_default' => true],
                    ['name' => 'Clear + Teal Sleeve', 'color_hex' => '#008080', 'is_default' => false],
                    ['name' => 'Clear + Coral Sleeve', 'color_hex' => '#ff7f50', 'is_default' => false],
                ],
            ],
            [
                'name' => 'Copper Vacuum Flask',
                'slug' => 'copper-vacuum-flask',
                'description' => '500ml premium copper-plated vacuum flask with superior temperature retention. Copper lining enhances insulation by 30%. Leak-proof twist cap.',
                'price' => 285000,
                'stock' => 25,
                'is_active' => true,
                'variants' => [
                    ['name' => 'Rose Copper', 'color_hex' => '#b76e79', 'is_default' => true],
                    ['name' => 'Antique Copper', 'color_hex' => '#cd7f32', 'is_default' => false],
                    ['name' => 'Polished Copper', 'color_hex' => '#b87333', 'is_default' => false],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $variants = $productData['variants'];
            unset($productData['variants']);

            $product = Product::firstOrCreate(
                ['slug' => $productData['slug']],
                $productData
            );

            foreach ($variants as $index => $variantData) {
                ProductVariant::firstOrCreate(
                    ['product_id' => $product->id, 'name' => $variantData['name']],
                    array_merge($variantData, ['sort_order' => $index])
                );
            }

            // Create a placeholder thumbnail image record (no actual file)
            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'is_thumbnail' => true],
                [
                    'path' => 'products/placeholder-'.$product->slug.'.jpg',
                    'sort_order' => 0,
                    'is_thumbnail' => true,
                ]
            );
        }
    }
}
