<?php

use App\Enums\Role;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function safeguardSuperAdmin(): User
{
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin]);
    Sanctum::actingAs($superAdmin);

    return $superAdmin;
}

/**
 * Keep the authenticated actor in memory as a super admin (so the role
 * middleware lets the request through) while removing the actor's row from the
 * super_admin count in the database. That is how the "last super admin" guard
 * becomes reachable with a single remaining super admin.
 */
test('a super admin cannot demote themselves', function () {
    $superAdmin = safeguardSuperAdmin();

    $this->patchJson("/api/super-admin/users/{$superAdmin->id}/role", [
        'role' => 'user',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('role');

    expect($superAdmin->refresh()->role)->toBe(Role::SuperAdmin);

    $this->assertDatabaseHas('users', [
        'id' => $superAdmin->id,
        'role' => Role::SuperAdmin->value,
    ]);
});

test('a super admin cannot delete themselves', function () {
    $superAdmin = safeguardSuperAdmin();

    $this->deleteJson("/api/super-admin/users/{$superAdmin->id}")
        ->assertUnprocessable()
        ->assertExactJson(['message' => 'You cannot delete yourself']);

    $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
});

test('the last super admin cannot be demoted', function () {
    $actor = safeguardSuperAdmin();
    $target = User::factory()->create(['role' => Role::SuperAdmin]);

    // Leave only $target in the database as a super admin.
    User::whereKey($actor->id)->update(['role' => Role::User->value]);

    $this->patchJson("/api/super-admin/users/{$target->id}/role", [
        'role' => 'admin',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('role');

    expect($target->refresh()->role)->toBe(Role::SuperAdmin);
});

test('the last super admin cannot be deleted', function () {
    $actor = safeguardSuperAdmin();
    $target = User::factory()->create(['role' => Role::SuperAdmin]);

    User::whereKey($actor->id)->update(['role' => Role::User->value]);

    $this->deleteJson("/api/super-admin/users/{$target->id}")
        ->assertUnprocessable()
        ->assertExactJson(['message' => 'Cannot delete the last super admin']);

    $this->assertDatabaseHas('users', ['id' => $target->id]);
});

test('another super admin can be demoted when more than one exists', function () {
    safeguardSuperAdmin();
    $target = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->patchJson("/api/super-admin/users/{$target->id}/role", [
        'role' => 'admin',
    ])->assertOk()
        ->assertJsonPath('data.role', 'admin');

    expect($target->refresh()->role)->toBe(Role::Admin);
});

test('another super admin can be deleted when more than one exists', function () {
    safeguardSuperAdmin();
    $target = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->deleteJson("/api/super-admin/users/{$target->id}")
        ->assertOk()
        ->assertExactJson(['message' => 'User deleted']);

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('a regular admin cannot reach the safeguards at all', function () {
    $admin = User::factory()->create(['role' => Role::Admin]);
    Sanctum::actingAs($admin);
    $target = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->patchJson("/api/super-admin/users/{$target->id}/role", [
        'role' => 'user',
    ])->assertForbidden();

    $this->deleteJson("/api/super-admin/users/{$target->id}")
        ->assertForbidden();

    expect($target->refresh()->role)->toBe(Role::SuperAdmin);
});
