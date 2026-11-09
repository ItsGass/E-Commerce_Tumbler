<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
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

test('a forbidden web page renders the 403 page instead of raw json', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']));

    $response = $this->get('/admin');

    $response->assertForbidden();
    expect($response->headers->get('Content-Type'))->toContain('text/html');
    $response->assertInertia(fn (Assert $page) => $page->component('errors/403'));
    $response->assertDontSee('{"message":"Forbidden."}', false);
});

test('an admin gets the 403 page for the super-admin web route', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));

    $this->get('/admin/users')
        ->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page->component('errors/403'));
});

test('a super admin can open the user management page', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $this->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/users'));
});

test('a guest visiting an admin page is redirected to login', function () {
    $this->get('/admin')->assertRedirect('/login');
});

test('a web page request that expects json still gets the json 403', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']));

    $this->get('/admin', ['Accept' => 'application/json'])
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden.');
});
