<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, User $targetUser): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, User $targetUser): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, User $targetUser): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Cannot delete self
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Cannot delete last super admin
        if ($targetUser->role->value === 'super_admin') {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return false;
            }
        }

        return true;
    }

    public function changeRole(User $user, User $targetUser): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Cannot change own role
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Cannot demote last super admin
        if ($targetUser->role->value === 'super_admin') {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return false;
            }
        }

        return true;
    }
}
