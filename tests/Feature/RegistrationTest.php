<?php

use App\Enums\Role;
use App\Models\User;

function registrationPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'New Shopper',
        'email' => 'new-shopper@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], $overrides);
}

test('a registration is always created as a regular user', function () {
    $this->postJson('/api/auth/register', registrationPayload())
        ->assertCreated()
        ->assertJsonPath('data.role', 'user')
        ->assertJsonPath('data.abilities.can_admin', false)
        ->assertJsonPath('data.abilities.can_super_admin', false);

    $this->assertDatabaseHas('users', [
        'email' => 'new-shopper@example.com',
        'role' => Role::User->value,
    ]);
});

test('a registration cannot escalate its role through the payload', function () {
    $this->postJson('/api/auth/register', registrationPayload([
        'role' => 'super_admin',
        'abilities' => ['can_admin' => true, 'can_super_admin' => true],
        'profile_complete' => true,
    ]))->assertCreated()
        ->assertJsonPath('data.role', 'user')
        ->assertJsonPath('data.abilities.can_super_admin', false);

    $user = User::where('email', 'new-shopper@example.com')->sole();

    expect($user->role)->toBe(Role::User)
        ->and($user->isAdmin())->toBeFalse()
        ->and($user->isSuperAdmin())->toBeFalse();
});

test('registration does not leak the password hash', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());

    $response->assertCreated();
    expect($response->json('data'))->not->toHaveKey('password');
});
