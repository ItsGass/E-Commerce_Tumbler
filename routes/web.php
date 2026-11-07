<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'home')->name('home');
Route::inertia('/products', 'products')->name('products');
Route::inertia('/products/{slug}', 'product-detail')->name('product-detail');
Route::inertia('/cart', 'cart')->name('cart');
Route::inertia('/checkout', 'checkout')->name('checkout');
Route::inertia('/track', 'track')->name('track.index');
Route::inertia('/track/{code}', 'track')->name('track.show');
Route::inertia('/login', 'login')->name('login');
Route::inertia('/register', 'register')->name('register');
Route::inertia('/profile', 'profile')->name('profile');
Route::inertia('/orders', 'orders')->name('orders');

// Admin routes
Route::middleware(['auth', 'role:admin,super_admin'])->group(function () {
    Route::inertia('/admin', 'admin/dashboard')->name('admin.dashboard');
    Route::inertia('/admin/products', 'admin/products')->name('admin.products.index');
    Route::inertia('/admin/orders', 'admin/orders')->name('admin.orders.index');
});

// Super Admin routes
Route::middleware(['auth', 'role:super_admin'])->group(function () {
    Route::inertia('/admin/users', 'admin/users')->name('admin.users.index');
});

// Fallback for SPA routing (optional, for direct URL access).
//
// `/api/*` is deliberately excluded: API paths must answer with JSON (or a
// JSON 404 from routes/api.php), never with the SPA shell. The requirement is
// matched after the leading slash, so it must not contain `^` or `$` anchors.
Route::get('/{any}', function () {
    return Inertia::render('home');
})->where('any', '(?!(?:api)(?:/|$)).*');
