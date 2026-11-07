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

### Environment

The defaults work for local development. The values that matter for the SPA
login flow are:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite
SESSION_DRIVER=database
FILESYSTEM_DISK=local
SANCTUM_STATEFUL_DOMAINS=localhost:8000,127.0.0.1:8000
```

- `SANCTUM_STATEFUL_DOMAINS` must list the host **and port** the browser uses
  for the app (for example `localhost:8000`). Requests from a host that is not
  listed fall back to token authentication, so the session cookie is ignored
  and authenticated endpoints answer `401`.
- Keep the frontend and the API on the same host and port. The SPA calls
  relative `/api/*` and `/sanctum/csrf-cookie` URLs, and the session cookie is
  scoped to the exact hostname. In particular, do not open the app on
  `localhost:8000` and then call `127.0.0.1:8000` (or the reverse): the cookies
  written for one host are not sent to the other. Pick one and use it
  consistently.
- `FRONTEND_URL` is the allowed CORS origin (`config/cors.php`). It does not
  move the app; Laravel still serves the pages and assets.
- Changing `.env` while a dev server is running may require
  `php artisan config:clear`.

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

## Findings

### Closed

| ID | Finding | Resolution |
| --- | --- | --- |
| F-12 | Admin dashboard crashed with `Cannot read properties of undefined (reading 'length')`; `/api/admin/dashboard` did not exist and the SPA catch-all answered with HTML. | Added `AdminDashboardController` returning the flat stats object and made the page tolerate partial payloads (`09cd30e`). |
| API-404 | Unknown `/api/*` paths returned the SPA shell with `200 text/html`, hiding missing endpoints. | JSON `404 {"message":"Not found"}` fallback; the SPA catch-all now excludes `/api/*` (`afa9672`). |
| ADMIN-META | Paginated collections returned `meta.current_page: [1,1]` and `path: [url,url]` because a custom `meta` was merged recursively with the paginator's. | Collections return only `data`; the paginator adds `links`/`meta` (`09cd30e`). |
| ADMIN-ORDERS | Admin order list/detail read flat `buyer_name` fields while `OrderResource` returns a nested `buyer` object, so the cells were blank. | Read `buyer.name` / `buyer.email` / `buyer.phone` (`09cd30e`). |
| ADMIN-EDIT | Product "Edit" linked to `/admin/products/{id}/edit`, which the SPA catch-all rendered as the home page. | In-page edit modal and a `PATCH` product route (`09cd30e`). |
| UPLOAD-422 | Multipart admin uploads were JSON-encoded by the axios instance default, so `/images` answered `422 image: required`. | Multipart requests explicitly set `Content-Type: multipart/form-data` (`48b651b`). |
| UPLOAD-CLEANUP | Replacing a thumbnail only cleared the old `is_thumbnail` flag (row and file stayed), and there was no image delete endpoint. | Replacing a thumbnail deletes the old row/file; `DELETE /products/{product}/images/{image}` deletes both and 404s for another product's image (`48b651b`). |
| F-TEST-1 | `UserFactory` did not set `role`; the in-memory model had `role = NULL` until `refresh()`, crashing `isAdmin()`. | Factory sets `role => Role::User`, matching the column default (`da82c76`). |
| F-TEST-2 | `OrderFactory` read `->id` from a nested `UserFactory` instance and failed whenever it picked the non-guest branch. | Pass the nested factory through for Laravel to expand (`e82d5e5`). |
| F-MARKPAID | `$order->status === 'paid'` compared the cast enum with a string, so the "already paid" branch was unreachable and returned 422. | Compare with `OrderStatus::Paid` (`63e54a2`). |
| F-ROLE | `role:admin,super_admin` was received as two handler arguments but only one `string $roles` was declared, so only `admin` was allowed; super admins got 403 on every admin endpoint. | Variadic role parameters in `EnsureUserHasRole` (`9de6acd`). |
| F-ROLE-REQ | `ChangeUserRoleRequest::withValidator()` used `$targetUser`/`$currentUser` locals that only existed in `rules()`, so every role change answered 500. | Resolve the route user and actor inside the validation callback (`e852285`). |
| F-TRACK | Guest tracking used email-then-phone (`if/elseif`), so a correct phone was ignored when a wrong email was also sent. | Group the two identifiers with `OR` inside the code constraint (`d18fdc5`). |
| V-05 | Seeded image rows pointed at files that are never generated, so tiles showed broken-image glyphs. | `ProductImage` with a designed tumbler silhouette fallback. |
| V-06 | Below `lg` the header exposed no route to orders/admin/profile or sign in/out. | Mobile hamburger with `aria-controls`/`aria-expanded`. |
| V-07 | Horizontal overflow at 390px on the catalog/cart/checkout/track grids. | Explicit `grid-cols-1` and `min-w-0` on the columns. |
| V-22 | `/checkout` asked the user to press "Proceed to Checkout" again after arriving from that button. | Validate on mount with a spinner and keep the user on the summary on failure. |
| CHECKOUT-CONFIRM | A placed order emptied the cart, and the empty-cart screen shadowed the confirmation, so `/checkout` and `/cart` showed "Your cart is empty" instead of "Order Confirmed!" and the buyer never saw the order code. | The success step now wins over the empty-cart guard; `/cart` renders the same confirmation panel and keeps the code. |
| TRACK-CRASH | `/track` crashed with `Cannot read properties of undefined (reading 'name')`: `GET /api/orders/{code}/track` answers with a resource wrapper (`{"data": {...}}`) but the hook handed the wrapper to the page, which read `order.buyer` from an object that has none. | The hook unwraps `data`; a regression test drives the screen with a wrapped payload. |
| TRACK-PREFILL | `/track/{code}` ignored the code in the path, so the "Track Order" link on the confirmation screen landed on an empty form. | The page prefills the code from the current path. |
| TEST-IN-PAGES | A test file under `resources/js/pages/` is picked up by the Inertia Vite plugin's `./pages/**/*` page glob, which pulled `vitest` into the app bundle and broke the built app at start-up. | Frontend page tests live outside `resources/js/pages/` (`resources/js/app.track.test.tsx`); the build stays free of test code. |

### Deferred

| ID | Finding | Why it is deferred |
| --- | --- | --- |
| GLB-RENDER | GLB upload, validation (extension/mime/size) and cleanup work, but no real `.glb` has been loaded in the viewer. | Needs a real asset and a visual check; upload alone does not prove the render path. |
| PAYMENT | Payment is mocked: orders start `pending` and an admin marks them paid; there is no gateway, webhook or refund flow. | Out of scope for this stabilization batch. |
| IOS | Responsive checks were run in Chrome/CDP at `390x844`; no physical iOS or Safari run. | No device available. |

### New in Batch 5

The following were discovered by the new feature tests and fixed, each in its
own commit: `F-TEST-1` (`da82c76`), `F-TEST-2` (`e82d5e5`), `F-MARKPAID`
(`63e54a2`), `F-ROLE` (`9de6acd`), `F-ROLE-REQ` (`e852285`) and `F-TRACK`
(`d18fdc5`). `ADMIN-META` was found while verifying the admin screens
(`09cd30e`).

### New in Batch 6

The stabilization branch added the super-admin self-guard follow-up
(`37ad45d`), the verified stock-concurrency notes (`6da03ed`) and the opt-in
demo product images (`67a5843`). The final browser pass over all four roles
then found and fixed `CHECKOUT-CONFIRM`, `TRACK-CRASH`, `TRACK-PREFILL` and
`TEST-IN-PAGES` in one commit.

## Known limitations

- **The GLB and texture render path is not verified.** Uploads are validated
  server-side and stored correctly, but no real `.glb` model or variant texture
  has been loaded into the 3D viewer in a browser. See "3D viewer status".
- **Payment is mocked.** Checkout creates a `pending` order; the admin
  "mark paid" action is the only way an order becomes `paid`. No payment
  provider is integrated.
- **No iOS device testing.** Layout and touch behavior were checked in headless
  Chrome at 1440px and 390px (light and dark), not on a physical iPhone or in
  Safari.
- **Seeded product images have no files.** Until an image is uploaded, the UI
  shows the designed silhouette rather than a photo.
- **Stock is tracked per product, not per variant.** Variants share the
  product's `stock` column.

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

### Demo product images (opt-in)

For a demo catalogue that is not full of silhouette tiles, the seeder can
generate one small solid-colour PNG per product with GD. The generated files
are written to the public disk under `products/images/` and the product's
thumbnail row is pointed at them.

This is **opt-in**. A plain `php artisan db:seed` does not generate images and
does not need the `gd` extension:

```bash
# generate the demo images together with the rest of the seed
SEED_DEMO_IMAGES=true php artisan db:seed

# or generate only the demo images
php artisan db:seed --class=DemoImageSeeder
```

`SEED_DEMO_IMAGES` is listed in `.env.example` and defaults to `false`. The
seeder is idempotent: re-running it reuses the existing files and rows instead
of duplicating them. The generated PNGs live in `storage/app/public`, which is
git-ignored, so no binaries are committed.

## Stock concurrency

Checkout locks the product rows before it looks at the stock:

| Step | Location |
| --- | --- |
| Transaction opens | `app/Services/CheckoutService.php:63` |
| `lockForUpdate()` on the product rows | `app/Services/CheckoutService.php:65-68` |
| Stock re-check (after the lock, same transaction) | `app/Services/CheckoutService.php:71-79` |
| Order, order items and `stock` decrement (same transaction) | `app/Services/CheckoutService.php:99-114` |

**SQLite does not implement row locking**, and the test suite runs on
`sqlite :memory:` (`phpunit.xml`), so the suite can only prove the sequential
case — `tests/Feature/OrderStockTest.php` ("an oversell is rejected and no
order or stock change is written"). Do not read that test as proof of race
safety.

The concurrent case was verified manually against **MySQL 8.0.30**: two PHP
processes (and, in a stress round, four) fired `POST /api/checkout/guest` for
the last unit of one product at the same instant. Every round produced:

- exactly one `201` (`Order created successfully`); the other request(s) got
  `422` with `Insufficient stock for <product>`;
- `products.stock` ended at `0` and never went negative (the column is
  `int unsigned` in MySQL);
- exactly one `orders` row and one `order_items` row, with no orphan
  `order_items` and no order without items;
- the MySQL general log and `performance_schema` showed the losing
  transactions blocked on the locking read
  (`select * from products where id in (1) for update`; 5.4 ms and
  7.4/7.6 ms waits) until the winner committed, then read the committed stock
  of `0` and rolled back.

To repeat it, point the app at MySQL and run two application processes against
the same database (one request per process, fired at the same moment):

```bash
# process A
DB_CONNECTION=mysql DB_HOST=localhost DB_PORT=3306 DB_DATABASE=tumbler \
  php artisan serve --port=8011
# process B
DB_CONNECTION=mysql DB_HOST=localhost DB_PORT=3306 DB_DATABASE=tumbler \
  php artisan serve --port=8012
```

`php artisan serve` is single-threaded, so two processes are needed for a real
race on a single machine.

> The default database is SQLite. Deploy with MySQL (or another engine with
> real row locking) if concurrent checkouts matter.

