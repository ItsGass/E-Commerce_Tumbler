<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Products considered for the hero marquee.
     */
    private const HERO_PRODUCT_LIMIT = 6;

    /**
     * Hard cap on the cards handed to the marquee.
     */
    private const HERO_IMAGE_LIMIT = 12;

    public function __invoke(): Response
    {
        $heroProducts = Product::query()
            ->where('is_active', true)
            ->with(['thumbnail', 'images'])
            ->orderBy('created_at', 'desc')
            ->limit(self::HERO_PRODUCT_LIMIT)
            ->get()
            ->flatMap(fn (Product $product): Collection => $this->heroCards($product))
            ->take(self::HERO_IMAGE_LIMIT)
            ->values();

        return Inertia::render('home', [
            'heroProducts' => $heroProducts,
        ]);
    }

    /**
     * A product contributes its thumbnail and one gallery image. When it has
     * no image rows at all, keep one card so the UI can render the silhouette.
     *
     * @return Collection<int, array{id: int, name: string, slug: string, price: int, image: string|null}>
     */
    private function heroCards(Product $product): Collection
    {
        $images = collect([$product->thumbnail?->url])
            ->merge($product->images->pluck('url'))
            ->filter()
            ->unique()
            ->take(2)
            ->values();

        if ($images->isEmpty()) {
            $images->push(null);
        }

        return $images->map(fn (?string $url): array => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'image' => $url,
        ]);
    }
}
