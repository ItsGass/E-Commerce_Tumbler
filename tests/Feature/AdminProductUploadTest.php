<?php

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Storage::fake('public');

    $this->admin = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($this->admin);
});

function fakeGlb(string $name = 'model.glb', int $kilobytes = 100, string $mime = 'model/gltf-binary'): UploadedFile
{
    return UploadedFile::fake()->create($name, $kilobytes, $mime);
}

test('an admin can upload a glb model', function () {
    $product = Product::factory()->create();

    $response = $this->post("/api/admin/products/{$product->id}/glb", [
        'glb' => fakeGlb(),
    ], ['Accept' => 'application/json']);

    $response->assertOk();
    $response->assertJsonPath('message', 'GLB uploaded successfully');

    $product->refresh();
    expect($product->glb_path)->not->toBeNull()
        ->and($product->glb_original_name)->toBe('model.glb');

    Storage::disk('public')->assertExists($product->glb_path);
});

test('a glb with the wrong extension is rejected', function () {
    $product = Product::factory()->create();

    $response = $this->post("/api/admin/products/{$product->id}/glb", [
        'glb' => fakeGlb('model.txt', 100, 'model/gltf-binary'),
    ], ['Accept' => 'application/json']);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('glb');
    expect($product->refresh()->glb_path)->toBeNull();
});

test('a glb with the wrong mime type is rejected', function () {
    $product = Product::factory()->create();

    $response = $this->post("/api/admin/products/{$product->id}/glb", [
        'glb' => fakeGlb('model.glb', 100, 'application/octet-stream'),
    ], ['Accept' => 'application/json']);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('glb');
    expect($product->refresh()->glb_path)->toBeNull();
});

test('an oversize glb is rejected', function () {
    $product = Product::factory()->create();

    $response = $this->post("/api/admin/products/{$product->id}/glb", [
        'glb' => fakeGlb('model.glb', 10241),
    ], ['Accept' => 'application/json']);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('glb');
    expect($product->refresh()->glb_path)->toBeNull();
});

test('replacing a glb deletes the old file', function () {
    $product = Product::factory()->create([
        'glb_path' => 'products/glb/old.glb',
        'glb_original_name' => 'old.glb',
    ]);
    Storage::disk('public')->put('products/glb/old.glb', 'old');

    $this->post("/api/admin/products/{$product->id}/glb", [
        'glb' => fakeGlb(),
    ], ['Accept' => 'application/json'])->assertOk();

    Storage::disk('public')->assertMissing('products/glb/old.glb');
    Storage::disk('public')->assertExists($product->refresh()->glb_path);
});

test('uploading a new thumbnail deletes the previous thumbnail row and file', function () {
    $product = Product::factory()->create();
    Storage::disk('public')->put('products/images/old-thumb.png', 'old');
    $old = $product->images()->create([
        'path' => 'products/images/old-thumb.png',
        'sort_order' => 0,
        'is_thumbnail' => true,
    ]);

    $response = $this->post("/api/admin/products/{$product->id}/images", [
        'image' => UploadedFile::fake()->image('thumb.png', 8, 8),
        'is_thumbnail' => '1',
    ], ['Accept' => 'application/json']);

    $response->assertCreated();
    $response->assertJsonPath('data.is_thumbnail', true);

    Storage::disk('public')->assertMissing('products/images/old-thumb.png');
    $this->assertDatabaseMissing('product_images', ['id' => $old->id]);

    $newPath = ProductImage::where('product_id', $product->id)->sole()->path;
    Storage::disk('public')->assertExists($newPath);
});

test('deleting an image deletes its file', function () {
    $product = Product::factory()->create();
    Storage::disk('public')->put('products/images/gone.png', 'gone');
    $image = $product->images()->create([
        'path' => 'products/images/gone.png',
        'sort_order' => 0,
        'is_thumbnail' => false,
    ]);

    $this->delete("/api/admin/products/{$product->id}/images/{$image->id}", [], [
        'Accept' => 'application/json',
    ])->assertOk();

    Storage::disk('public')->assertMissing('products/images/gone.png');
    $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
});

test('deleting a product deletes its image, glb and variant files', function () {
    $product = Product::factory()->create(['glb_path' => 'products/glb/product.glb']);
    $product->images()->create([
        'path' => 'products/images/product.png',
        'sort_order' => 0,
        'is_thumbnail' => true,
    ]);
    ProductVariant::factory()->for($product)->create([
        'texture_path' => 'products/textures/variant.png',
        'glb_path' => 'products/glb/variant.glb',
    ]);

    foreach ([
        'products/glb/product.glb',
        'products/images/product.png',
        'products/textures/variant.png',
        'products/glb/variant.glb',
    ] as $path) {
        Storage::disk('public')->put($path, 'x');
    }

    $this->delete("/api/admin/products/{$product->id}", [], [
        'Accept' => 'application/json',
    ])->assertOk();

    foreach ([
        'products/glb/product.glb',
        'products/images/product.png',
        'products/textures/variant.png',
        'products/glb/variant.glb',
    ] as $path) {
        Storage::disk('public')->assertMissing($path);
    }

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('an image from another product cannot be deleted through the route', function () {
    $product = Product::factory()->create();
    $other = Product::factory()->create();
    $image = $other->images()->create([
        'path' => 'products/images/other.png',
        'sort_order' => 0,
        'is_thumbnail' => true,
    ]);
    Storage::disk('public')->put('products/images/other.png', 'x');

    $this->delete("/api/admin/products/{$product->id}/images/{$image->id}", [], [
        'Accept' => 'application/json',
    ])->assertNotFound();

    Storage::disk('public')->assertExists('products/images/other.png');
    $this->assertDatabaseHas('product_images', ['id' => $image->id]);
});
