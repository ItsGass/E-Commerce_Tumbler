<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        User::firstOrCreate(
            ['email' => 'superadmin@tumblershop.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'role' => Role::SuperAdmin,
                'phone' => '081234567890',
                'street' => 'Jl. Admin Raya No. 1',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '10110',
                'email_verified_at' => now(),
            ]
        );

        // Admin
        User::firstOrCreate(
            ['email' => 'admin@tumblershop.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'role' => Role::Admin,
                'phone' => '081234567891',
                'street' => 'Jl. Admin No. 2',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '10120',
                'email_verified_at' => now(),
            ]
        );

        // Regular User
        User::firstOrCreate(
            ['email' => 'user@tumblershop.test'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password123'),
                'role' => Role::User,
                'phone' => '081234567892',
                'street' => 'Jl. User No. 3',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'postal_code' => '40111',
                'email_verified_at' => now(),
            ]
        );
    }
}
