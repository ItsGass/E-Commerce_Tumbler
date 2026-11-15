<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->string('sort')->toString();

        $query = Product::query()
            ->where('is_active', true)
            ->with(['variants', 'images', 'thumbnail', 'defaultVariant']);

        if ($sort === 'popular') {
            // Units sold across orders that were not cancelled. This is the
            // smallest honest "best sellers" definition: no manual ranking,
            // no extra table, and cancelled orders never count.
            $query
                ->withSum(
                    [
                        'orderItems as units_sold' => fn (Builder $orderItems) => $orderItems
                            ->whereHas(
                                'order',
                                fn (Builder $orders) => $orders->where(
                                    'status',
                                    '!=',
                                    OrderStatus::Cancelled->value,
                                ),
                            ),
                    ],
                    'quantity',
                )
                ->orderByDesc('units_sold')
                ->orderByDesc('created_at')
                ->orderByDesc('id');
        } else {
            $query->orderByDesc('created_at')->orderByDesc('id');
        }

        $perPage = min($request->integer('per_page', 15), 50);
        $products = $query->paginate($perPage)->withQueryString();

        return new ProductCollection($products);
    }

    public function show(Request $request, Product $product)
    {
        if (! $product->is_active) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->load(['variants', 'images', 'thumbnail', 'defaultVariant']);

        return new ProductResource($product);
    }

    public function viewerData(Request $request, Product $product)
    {
        if (! $product->is_active) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->load(['variants', 'images']);

        $variantTextures = $product->variants->map(function ($variant) {
            return [
                'id' => $variant->id,
                'name' => $variant->name,
                'color_hex' => $variant->color_hex,
                'texture_url' => $variant->texture_url,
                'glb_url' => $variant->glb_url,
            ];
        })->values();

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'glb_url' => $product->glb_url,
                'thumbnail_url' => $product->thumbnail?->url,
            ],
            'variants' => $variantTextures,
        ]);
    }
}
