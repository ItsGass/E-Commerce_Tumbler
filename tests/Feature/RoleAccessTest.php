<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

function actingAsRole(string $role): User
{
    $user = User::factory()->create(['role' => $role]);
    Sanctum::actingAs($user);

    return $user;
}

dataset('guest protected endpoints', [
    '/api/admin/dashboard',
    '/api/admin/products',
    '/api/admin/orders',
    '/api/super-admin/users',
    '/api/orders',
    '/api/auth/user',
]);

dataset('user forbidden endpoints', [
    '/api/admin/dashboard',
    '/api/admin/products',
    '/api/admin/orders',
    '/api/super-admin/users',
]);

test('a guest is unauthenticated on protected endpoints', function (string $uri) {
    $this->getJson($uri)->assertUnauthorized();
})->with('guest protected endpoints');

test('a regular user is forbidden from admin and user-management endpoints', function (string $uri) {
    actingAsRole('user');

    $this->getJson($uri)->assertForbidden();
})->with('user forbidden endpoints');

test('a regular user can read their own orders', function () {
    actingAsRole('user');

    $this->getJson('/api/orders')->assertOk();
    $this->getJson('/api/auth/user')->assertOk();
});

test('an admin can use admin endpoints but not user management', function () {
    actingAsRole('admin');

    $this->getJson('/api/admin/dashboard')->assertOk();
    $this->getJson('/api/admin/products')->assertOk();
    $this->getJson('/api/admin/orders')->assertOk();
    $this->getJson('/api/super-admin/users')->assertForbidden();
});

test('a super admin can use admin and user-management endpoints', function () {
    actingAsRole('super_admin');

    $this->getJson('/api/admin/dashboard')->assertOk();
    $this->getJson('/api/admin/products')->assertOk();
    $this->getJson('/api/admin/orders')->assertOk();
    $this->getJson('/api/super-admin/users')->assertOk();
});

test('the role middleware reports 401 for a guest and 403 for the wrong role', function () {
    // Guests never reach the role middleware because auth:sanctum answers first.
    $this->getJson('/api/admin/products')
        ->assertUnauthorized()
        ->assertJsonPath('message', 'Unauthenticated.');

    actingAsRole('user');

    $this->getJson('/api/admin/products')
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden.');
});
