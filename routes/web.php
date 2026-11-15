<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');
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

// Static storefront pages. The copy is demo content; see README.
Route::inertia('/shipping', 'info/shipping')->name('info.shipping');
Route::inertia('/returns', 'info/returns')->name('info.returns');
Route::inertia('/contact', 'info/contact')->name('info.contact');
Route::post('/contact', ContactController::class)->name('contact.store');
Route::inertia('/about', 'info/about')->name('info.about');
Route::inertia('/sustainability', 'info/sustainability')->name('info.sustainability');
Route::inertia('/careers', 'info/careers')->name('info.careers');
Route::inertia('/press', 'info/press')->name('info.press');
Route::inertia('/gift-cards', 'info/gift-cards')->name('info.gift-cards');
Route::inertia('/privacy', 'info/privacy')->name('info.privacy');
Route::inertia('/terms', 'info/terms')->name('info.terms');
Route::inertia('/cookies', 'info/cookies')->name('info.cookies');

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

// Unknown paths get a real 404 page. `/api/*` is deliberately absent here:
// routes/api.php answers those with JSON, including its own 404 fallback.
Route::fallback(function () {
    return Inertia::render('errors/404')
        ->toResponse(request())
        ->setStatusCode(404);
});
