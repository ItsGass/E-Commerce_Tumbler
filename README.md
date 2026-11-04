# Tumbler Shop

Laravel 13 API + React 19 / Inertia v3 storefront with a procedural 3D tumbler viewer, cart, guest and authenticated checkout, order tracking, and an admin area.

## Requirements

- PHP 8.5 with the `gd` extension
- Composer
- Node.js 22+ and npm
- SQLite (default) or another Laravel-supported database

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

`php artisan storage:link` is required: product images are served through
`asset('storage/...')`, so uploads are unreachable without the `public/storage`
symlink.

Start the app:

```bash
composer run dev
```

or run the pieces separately:

```bash
php artisan serve --port=8000
npm run dev
```

Seeded accounts (`password123`):

| Account | Role |
| --- | --- |
| `user@tumblershop.test` | user |
| `admin@tumblershop.test` | admin |
| `superadmin@tumblershop.test` | super admin |

## Tests and checks

```bash
php artisan test --compact
npm run types:check
npm run test:smoke
npx vp test run
npm run build
vendor/bin/pint --dirty
```

## 3D viewer status

The storefront renders the tumbler procedurally (lathe geometry plus a local
light probe). **The GLB and texture paths are not verified yet.** Every seeded
variant has `glb_url: null` and `texture_url: null`, so real `.glb` models and
uploaded textures have never been rendered in a browser. Do not assume the GLB
branch works until a real asset has been tested; validating it is a separate
task.

The viewer only loads on product detail pages. Vertical swipes pan the page,
horizontal drags rotate the model, and two-finger pinch is handled by the
viewer's orbit controls.

## Product images

`ProductSeeder` creates image rows whose files are intentionally not generated.
Until a real image is uploaded, product tiles, cart rows, checkout rows, and the
detail gallery show a designed tumbler silhouette instead of a broken-image
icon. Uploaded images require the `storage:link` step above.
