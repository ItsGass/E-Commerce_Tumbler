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
                'description' => implode("\n\n", [
                    'The Classic Stainless Tumbler is built around a 500 ml double-wall 18/8 stainless steel body with a vacuum-sealed core. It keeps iced drinks cold for up to 24 hours and coffee or tea hot for up to 12 hours, without sweating on the outside.',
                    'Weighing roughly 340 g, it fits standard car cup holders and ships with a leak-resistant press-fit lid. The powder-coated exterior resists fingerprints and light scratches.',
                    'Care: hand wash the body with warm water and mild soap, rinse the lid thoroughly, and leave both to air dry before storing. Do not put it in the dishwasher or microwave.',
                ]),
                'price' => 185000,
                'stock' => 50,
                'variants' => [
                    ['name' => 'Matte Black', 'color_hex' => '#1a1a1a'],
                    ['name' => 'Brushed Silver', 'color_hex' => '#c0c0c0'],
                    ['name' => 'Navy Blue', 'color_hex' => '#1e3a5f'],
                    ['name' => 'Forest Green', 'color_hex' => '#2d5016'],
                ],
            ],
            [
                'name' => 'Ceramic Coated Travel Mug',
                'slug' => 'ceramic-coated-travel-mug',
                'description' => implode("\n\n", [
                    'The Ceramic Coated Travel Mug holds 350 ml and lines its stainless steel core with a food-safe ceramic layer, so coffee tastes like coffee and never like metal. Double-wall vacuum insulation keeps drinks cold for about 12 hours and hot for about 8 hours.',
                    'At 310 g it is light enough for a commute, with a non-slip silicone base and a splash-resistant lid that opens with one hand.',
                    'Care: hand wash only; the ceramic lining and printed finish are not dishwasher safe. Avoid abrasive sponges and let it dry fully with the lid off.',
                ]),
                'price' => 220000,
                'stock' => 35,
                'variants' => [
                    ['name' => 'Pearl White', 'color_hex' => '#fafafa'],
                    ['name' => 'Charcoal Grey', 'color_hex' => '#36454f'],
                    ['name' => 'Blush Pink', 'color_hex' => '#de5d83'],
                ],
            ],
            [
                'name' => 'Insulated Sports Bottle',
                'slug' => 'insulated-sports-bottle',
                'description' => implode("\n\n", [
                    'The Insulated Sports Bottle carries 750 ml in a rugged 18/8 stainless steel shell. Vacuum insulation holds cold water for up to 30 hours and hot drinks for up to 14 hours.',
                    'It weighs about 420 g, includes a straw lid with a fold-away spout and a carry handle, and the wide mouth takes ice cubes without a funnel.',
                    'Care: the bottle body is hand-wash only, while the straw lid can be rinsed and air-dried. Wash before first use and after every sports session.',
                ]),
                'price' => 155000,
                'stock' => 80,
                'variants' => [
                    ['name' => 'Electric Blue', 'color_hex' => '#007bff'],
                    ['name' => 'Neon Green', 'color_hex' => '#39ff14'],
                    ['name' => 'Hot Pink', 'color_hex' => '#ff69b4'],
                    ['name' => 'Vibrant Orange', 'color_hex' => '#ff8c00'],
                ],
            ],
            [
                'name' => 'Minimalist Glass Tumbler',
                'slug' => 'minimalist-glass-tumbler',
                'description' => implode("\n\n", [
                    'The Minimalist Glass Tumbler is made from 400 ml borosilicate glass, wrapped in a removable silicone sleeve that improves grip and softens knocks. Glass keeps flavours neutral, whether you pour water, cold brew or herbal tea.',
                    'It weighs around 280 g and insulates moderately: cold drinks stay cool for about 8 hours and hot drinks warm for about 4 hours. The snug lid limits splashes but is not fully leak-proof.',
                    'Care: the glass and sleeve are dishwasher safe on the top rack; remove the sleeve first and let all parts dry completely. Do not freeze or pour boiling water into a cold tumbler.',
                ]),
                'price' => 149000,
                'stock' => 60,
                'variants' => [
                    ['name' => 'Clear + Grey Sleeve', 'color_hex' => '#808080'],
                    ['name' => 'Clear + Teal Sleeve', 'color_hex' => '#008080'],
                    ['name' => 'Clear + Coral Sleeve', 'color_hex' => '#ff7f50'],
                ],
            ],
            [
                'name' => 'Copper Vacuum Flask',
                'slug' => 'copper-vacuum-flask',
                'description' => implode("\n\n", [
                    'The Copper Vacuum Flask pairs a 500 ml stainless steel body with a copper-plated lining that reflects heat and improves insulation. It keeps cold drinks cold for up to 28 hours and hot drinks hot for up to 16 hours.',
                    'The flask weighs approximately 390 g and closes with a leak-proof twist cap. Its warm copper finish develops a subtle patina over time, which is normal and part of the character.',
                    'Care: hand wash with mild soap and a soft cloth; do not use abrasive polish on the copper finish. Dry the cap and threads before closing the flask for storage.',
                ]),
                'price' => 285000,
                'stock' => 25,
                'variants' => [
                    ['name' => 'Rose Copper', 'color_hex' => '#b76e79'],
                    ['name' => 'Antique Copper', 'color_hex' => '#cd7f32'],
                    ['name' => 'Polished Copper', 'color_hex' => '#b87333'],
                ],
            ],
            [
                'name' => 'Summit Trail Tumbler',
                'slug' => 'summit-trail-tumbler',
                'description' => implode("\n\n", [
                    'The Summit Trail Tumbler is a 600 ml companion for day hikes and camp mornings. Its powder-coated 18/8 stainless steel body and vacuum core keep water cold for up to 26 hours and tea hot for up to 13 hours.',
                    'A moulded side handle and a textured grip make it easy to carry with gloves, while the 360 g weight stays comfortable in a backpack pocket. The press lid seals firmly for transport.',
                    'Care: hand wash the body, rinse the lid, and air dry both with the lid removed. Avoid harsh detergents and never place the tumbler over an open flame.',
                ]),
                'price' => 249000,
                'stock' => 42,
                'variants' => [
                    ['name' => 'Alpine Green', 'color_hex' => '#3f5d45'],
                    ['name' => 'Granite Grey', 'color_hex' => '#5a5f63'],
                    ['name' => 'Canyon Clay', 'color_hex' => '#a35c3f'],
                ],
            ],
            [
                'name' => 'Daily Brew Desk Mug',
                'slug' => 'daily-brew-desk-mug',
                'description' => implode("\n\n", [
                    'The Daily Brew Desk Mug is sized at 450 ml for a long morning at the desk. A ceramic-coated stainless interior keeps the taste clean, and the vacuum wall holds cold drinks for about 10 hours and hot coffee for about 6 hours.',
                    'At 300 g it sits steadily on a coaster, and the sliding lid helps keep dust and spills out between sips. The handle is wide enough for a full hand.',
                    'Care: hand wash with warm water and a soft brush; the sliding lid should be rinsed and dried open. Not dishwasher or microwave safe.',
                ]),
                'price' => 199000,
                'stock' => 3,
                'variants' => [
                    ['name' => 'Oat Cream', 'color_hex' => '#e8ddc7'],
                    ['name' => 'Espresso Brown', 'color_hex' => '#4b3621'],
                    ['name' => 'Sage Green', 'color_hex' => '#9caf88'],
                ],
            ],
            [
                'name' => 'Ocean Recycled Tumbler',
                'slug' => 'ocean-recycled-tumbler',
                'description' => implode("\n\n", [
                    'The Ocean Recycled Tumbler is made with a 550 ml stainless steel body that uses a high share of recycled metal. Double-wall vacuum insulation keeps drinks cold for up to 22 hours and hot for up to 11 hours.',
                    'It weighs about 350 g and has a slim profile that fits most bike cages and side pockets. The lid includes a silicone gasket for a confident seal.',
                    'Care: hand wash the body and lid, then air dry with the gasket removed. Do not soak for long periods or use chlorine-based cleaners.',
                ]),
                'price' => 229000,
                'stock' => 18,
                'variants' => [
                    ['name' => 'Sea Glass', 'color_hex' => '#7fb7a8'],
                    ['name' => 'Deep Navy', 'color_hex' => '#1b2a41'],
                    ['name' => 'Coral Reef', 'color_hex' => '#f0806a'],
                ],
            ],
            [
                'name' => 'Midnight Matte Tumbler',
                'slug' => 'midnight-matte-tumbler',
                'description' => implode("\n\n", [
                    'The Midnight Matte Tumbler is a 480 ml everyday cup with a soft-touch matte finish that hides fingerprints. Its double-wall stainless core keeps cold drinks cold for up to 20 hours and hot drinks hot for up to 10 hours.',
                    'Weighing roughly 330 g, it has a tapered base for cup holders and a low-profile lid that stays out of the way while drinking.',
                    'Care: hand wash only with a non-abrasive sponge. The matte coating can dull if scrubbed with steel wool or washed in a dishwasher.',
                ]),
                'price' => 179000,
                'stock' => 64,
                'variants' => [
                    ['name' => 'Midnight Black', 'color_hex' => '#111318'],
                    ['name' => 'Storm Grey', 'color_hex' => '#4a4e57'],
                    ['name' => 'Burgundy', 'color_hex' => '#6d1f2f'],
                ],
            ],
            [
                'name' => 'Alpine Wide-Mouth Bottle',
                'slug' => 'alpine-wide-mouth-bottle',
                'description' => implode("\n\n", [
                    'The Alpine Wide-Mouth Bottle holds a full litre for long days away from a tap. The 18/8 stainless steel body and vacuum insulation keep water cold for up to 32 hours and hot drinks hot for up to 16 hours.',
                    'Its 520 g build includes a wide 5 cm mouth for ice, a removable strainer for fruit infusions, and a sturdy loop cap. The powder-coated finish is easy to grip even when wet.',
                    'Care: hand wash the bottle and cap, rinse the strainer, and leave all parts open to dry. Do not put the bottle in the dishwasher or freeze it full.',
                ]),
                'price' => 319000,
                'stock' => 22,
                'variants' => [
                    ['name' => 'Glacier White', 'color_hex' => '#f4f6f8'],
                    ['name' => 'Pine Green', 'color_hex' => '#244f3a'],
                    ['name' => 'Slate Blue', 'color_hex' => '#4a6fa5'],
                ],
            ],
            [
                'name' => 'Heritage Enamel Tumbler',
                'slug' => 'heritage-enamel-tumbler',
                'description' => implode("\n\n", [
                    'The Heritage Enamel Tumbler brings a vintage camping look to a 380 ml cup. An enamel coating over steel gives it a glossy, chip-resistant surface, while the thin wall keeps it light at about 260 g.',
                    'Insulation is modest by design: cold drinks stay cool for roughly 6 hours and hot drinks warm for about 3 hours. The rolled rim is comfortable to drink from, and the handle is sized for a gloved hand.',
                    'Care: hand wash gently and dry immediately to protect the enamel; do not use abrasive pads. Enamel can chip if dropped, so treat it like a favourite camp mug.',
                ]),
                'price' => 269000,
                'stock' => 0,
                'variants' => [
                    ['name' => 'Vintage Cream', 'color_hex' => '#f3ead7'],
                    ['name' => 'Barn Red', 'color_hex' => '#8b2e2e'],
                    ['name' => 'Cobalt Blue', 'color_hex' => '#2b4c8c'],
                ],
            ],
            [
                'name' => 'Pro Hydration Flask',
                'slug' => 'pro-hydration-flask',
                'description' => implode("\n\n", [
                    'The Pro Hydration Flask is the largest bottle in the range at 900 ml, built from 18/8 stainless steel with a high-performance vacuum core. It keeps cold water cold for up to 36 hours and hot drinks hot for up to 18 hours.',
                    'At around 480 g it balances capacity with portability, and the chug cap opens wide for fast drinking during training. A textured base protects surfaces and reduces clatter.',
                    'Care: hand wash the body and cap, then air dry fully before reassembling. Do not use the flask for carbonated drinks or store dairy in it for long periods.',
                ]),
                'price' => 489000,
                'stock' => 12,
                'variants' => [
                    ['name' => 'Carbon Black', 'color_hex' => '#1c1c1e'],
                    ['name' => 'Volt Yellow', 'color_hex' => '#d7e021'],
                    ['name' => 'Steel Blue', 'color_hex' => '#5b7c99'],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $variants = $productData['variants'];
            unset($productData['variants']);

            $product = Product::updateOrCreate(
                ['slug' => $productData['slug']],
                array_merge($productData, ['is_active' => true])
            );

            foreach ($variants as $index => $variantData) {
                ProductVariant::updateOrCreate(
                    ['product_id' => $product->id, 'name' => $variantData['name']],
                    array_merge($variantData, [
                        'sort_order' => $index,
                        'is_default' => $index === 0,
                    ])
                );
            }

            // A placeholder row keeps the catalog visually complete when
            // demo images are not generated. DemoImageSeeder replaces the path
            // with a real PNG when it runs.
            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'is_thumbnail' => true],
                [
                    'path' => 'products/placeholder-'.$product->slug.'.jpg',
                    'sort_order' => 0,
                ]
            );
        }
    }
}
