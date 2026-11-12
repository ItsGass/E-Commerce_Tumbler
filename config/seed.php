<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Demo Product Images
    |--------------------------------------------------------------------------
    |
    | When enabled, `php artisan db:seed` also generates small placeholder
    | product images with GD and stores them on the public disk, so a freshly
    | seeded catalog is not empty looking. The default is off, which keeps a
    | plain seed working without the GD extension and without touching the
    | public disk.
    |
    | Enable it with `SEED_DEMO_IMAGES=true` in the environment, or run
    | `php artisan db:seed --class=DemoImageSeeder` to generate only them.
    |
    */

    'demo_images' => (bool) env('SEED_DEMO_IMAGES', false),

    /*
    |--------------------------------------------------------------------------
    | Optimized Demo Photo Directory
    |--------------------------------------------------------------------------
    |
    | Where `DemoImageSeeder` looks for the optimized `{slug}-{1,2,3}.jpg`
    | photos. The directory is committed to the repository; override it in a
    | test to exercise partial photo sets without touching the real assets.
    |
    */

    'demo_assets' => database_path('seeders/demo-assets'),

];
