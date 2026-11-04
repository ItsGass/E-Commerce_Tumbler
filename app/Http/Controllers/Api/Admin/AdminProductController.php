<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreProductRequest;
use App\Http\Requests\Api\Admin\StoreVariantRequest;
use App\Http\Requests\Api\Admin\UpdateProductRequest;
use App\Http\Requests\Api\Admin\UpdateVariantRequest;
use App\Http\Requests\Api\Admin\UploadGlbRequest;
use App\Http\Requests\Api\Admin\UploadImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['variants', 'images', 'thumbnail'])
            ->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $perPage = min($request->integer('per_page', 15), 50);
        $products = $query->paginate($perPage)->withQueryString();

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());

        return (new ProductResource($product->load('variants', 'images')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load('variants', 'images'));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return new ProductResource($product->load('variants', 'images'));
    }

    public function destroy(Product $product)
    {
        // Delete associated files
        if ($product->glb_path && Storage::disk('public')->exists($product->glb_path)) {
            Storage::disk('public')->delete($product->glb_path);
        }

        foreach ($product->variants as $variant) {
            if ($variant->texture_path && Storage::disk('public')->exists($variant->texture_path)) {
                Storage::disk('public')->delete($variant->texture_path);
            }
            if ($variant->glb_path && Storage::disk('public')->exists($variant->glb_path)) {
                Storage::disk('public')->delete($variant->glb_path);
            }
        }

        foreach ($product->images as $image) {
            if (Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    public function uploadGlb(UploadGlbRequest $request, Product $product)
    {
        // Delete old GLB if exists
        if ($product->glb_path && Storage::disk('public')->exists($product->glb_path)) {
            Storage::disk('public')->delete($product->glb_path);
        }

        $file = $request->file('glb');
        $filename = Str::slug($product->name).'-'.Str::random(8).'.glb';
        $path = $file->storeAs('products/glb', $filename, 'public');

        $product->update([
            'glb_path' => $path,
            'glb_original_name' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message' => 'GLB uploaded successfully',
            'glb_url' => $product->glb_url,
        ]);
    }

    public function storeVariant(StoreVariantRequest $request, Product $product)
    {
        $data = $request->validated();

        // Handle texture upload
        if ($request->hasFile('texture')) {
            $file = $request->file('texture');
            $filename = Str::slug($data['name']).'-'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $data['texture_path'] = $file->storeAs('products/textures', $filename, 'public');
        }

        // Handle variant GLB upload
        if ($request->hasFile('glb')) {
            $file = $request->file('glb');
            $filename = Str::slug($data['name']).'-'.Str::random(8).'.glb';
            $data['glb_path'] = $file->storeAs('products/glb/variants', $filename, 'public');
        }

        // If this is set as default, unset other defaults
        if ($data['is_default'] ?? false) {
            $product->variants()->where('is_default', true)->update(['is_default' => false]);
        }

        $variant = $product->variants()->create($data);

        return (new ProductVariantResource($variant))
            ->response()
            ->setStatusCode(201);
    }

    public function updateVariant(UpdateVariantRequest $request, Product $product, ProductVariant $variant)
    {
        $data = $request->validated();

        // Handle texture upload
        if ($request->hasFile('texture')) {
            // Delete old texture
            if ($variant->texture_path && Storage::disk('public')->exists($variant->texture_path)) {
                Storage::disk('public')->delete($variant->texture_path);
            }
            $file = $request->file('texture');
            $filename = Str::slug($data['name'] ?? $variant->name).'-'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $data['texture_path'] = $file->storeAs('products/textures', $filename, 'public');
        }

        // Handle variant GLB upload
        if ($request->hasFile('glb')) {
            if ($variant->glb_path && Storage::disk('public')->exists($variant->glb_path)) {
                Storage::disk('public')->delete($variant->glb_path);
            }
            $file = $request->file('glb');
            $filename = Str::slug($data['name'] ?? $variant->name).'-'.Str::random(8).'.glb';
            $data['glb_path'] = $file->storeAs('products/glb/variants', $filename, 'public');
        }

        // If this is set as default, unset other defaults
        if ($data['is_default'] ?? false) {
            $product->variants()->where('is_default', true)->where('id', '!=', $variant->id)->update(['is_default' => false]);
        }

        $variant->update($data);

        return new ProductVariantResource($variant);
    }

    public function destroyVariant(Product $product, ProductVariant $variant)
    {
        // Delete associated files
        if ($variant->texture_path && Storage::disk('public')->exists($variant->texture_path)) {
            Storage::disk('public')->delete($variant->texture_path);
        }
        if ($variant->glb_path && Storage::disk('public')->exists($variant->glb_path)) {
            Storage::disk('public')->delete($variant->glb_path);
        }

        $variant->delete();

        return response()->json(['message' => 'Variant deleted']);
    }

    public function uploadImage(UploadImageRequest $request, Product $product)
    {
        $data = $request->validated();
        $file = $request->file('image');
        $filename = Str::slug($product->name).'-'.Str::random(8).'.'.$file->getClientOriginalExtension();
        $data['path'] = $file->storeAs('products/images', $filename, 'public');

        // If this is set as thumbnail, unset other thumbnails
        if ($data['is_thumbnail'] ?? false) {
            $product->images()->where('is_thumbnail', true)->update(['is_thumbnail' => false]);
        }

        $image = $product->images()->create($data);

        return (new ProductImageResource($image))
            ->response()
            ->setStatusCode(201);
    }
}
