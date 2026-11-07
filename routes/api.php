<?php

use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SuperAdmin\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/products/{product:slug}/viewer', [ProductController::class, 'viewerData']);

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:login');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/user', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Cart validation (guest + user)
Route::post('/cart/validate', [CartController::class, 'validate']);

// Guest checkout
Route::post('/checkout/guest', [CheckoutController::class, 'guest'])->middleware('throttle:checkout');

// User checkout
Route::post('/checkout/user', [CheckoutController::class, 'user'])
    ->middleware(['auth:sanctum', 'throttle:checkout']);

// Order tracking (guest - code + email/phone)
Route::get('/orders/{code}/track', [OrderController::class, 'track'])
    ->middleware('throttle:guest-track');

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->prefix('admin')->group(function () {
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{product}', [AdminProductController::class, 'show']);
    Route::put('/products/{product}', [AdminProductController::class, 'update']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
    Route::post('/products/{product}/glb', [AdminProductController::class, 'uploadGlb']);
    Route::post('/products/{product}/variants', [AdminProductController::class, 'storeVariant']);
    Route::put('/products/{product}/variants/{variant}', [AdminProductController::class, 'updateVariant']);
    Route::delete('/products/{product}/variants/{variant}', [AdminProductController::class, 'destroyVariant']);
    Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImage']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/mark-paid', [AdminOrderController::class, 'markPaid']);
});

// Super Admin routes
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('super-admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::patch('/users/{user}/role', [UserController::class, 'changeRole']);
});

// Unknown API paths must answer with JSON. `Route::any` (instead of
// `Route::fallback`) also covers `/api` itself and every HTTP method.
Route::any('/{any?}', fn () => response()->json(['message' => 'Not found'], 404))
    ->where('any', '.*');
