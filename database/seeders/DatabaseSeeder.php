<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $seeders = [
            RoleSeeder::class,
            ProductSeeder::class,
        ];

        if (config('seed.demo_images')) {
            $seeders[] = DemoImageSeeder::class;
        }

        $this->call($seeders);
    }
}
