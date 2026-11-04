<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Cart\ValidateCartRequest;
use App\Models\Product;
use App\Services\CheckoutService;

class CartController extends Controller
{
    public function validate(ValidateCartRequest $request, CheckoutService $checkoutService)
    {
        $items = $request->validated('items');
        $totals = $checkoutService->calculateTotals($items);

        // Verify each product exists and has stock
        $productIds = array_column($items, 'product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $validatedItems = [];
        foreach ($items as $item) {
            $product = $products[$item['product_id']] ?? null;
            if (! $product) {
                return response()->json([
                    'message' => "Product not found: {$item['product_id']}",
                ], 422);
            }

            if ($product->stock < $item['quantity']) {
                return response()->json([
                    'message' => "Insufficient stock for {$product->name}",
                    'available' => $product->stock,
                ], 422);
            }

            $variantId = $item['variant_id'] ?? null;
            $variantName = null;
            if ($variantId) {
                $variant = $product->variants()->find($variantId);
                $variantName = $variant?->name;
            }

            $validatedItems[] = [
                'product_id' => $product->id,
                'variant_id' => $variantId,
                'quantity' => $item['quantity'],
                'name' => $product->name,
                'price' => $product->price,
                'image' => $product->thumbnail?->url,
                'variant_name' => $variantName,
            ];
        }

        return response()->json([
            'items' => $validatedItems,
            'totals' => $totals,
        ]);
    }
}
