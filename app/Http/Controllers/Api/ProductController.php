<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with(['variants', 'images', 'thumbnail', 'defaultVariant'])
            ->orderBy('created_at', 'desc');

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
