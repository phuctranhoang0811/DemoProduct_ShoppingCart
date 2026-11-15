# Hellobee Store API

Laravel 13 backend for the Enagic® Kangen Water® / Hellobee storefront (the Next.js app in the
repository root). It owns the catalog, accounts, orders, payments, the consultant network and the
back office. The storefront talks to it server-to-server; browsers never call it directly.

## Run it locally

Requires Docker. PHP and Composer are not needed on the host.

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

The API is then at `http://localhost:8000` (`GET /api/v1/health`). In the repository root, set
`API_URL=http://localhost:8000` in `.env.local` and start the storefront with `npm run dev`.

| Task | Command |
| --- | --- |
| Tests | `docker compose exec app php artisan test` |
| Code style | `docker compose exec app ./vendor/bin/pint` |
| Reset the database | `docker compose exec app php artisan migrate:fresh --seed` |
| Refresh seed data from `src/data` | `npx tsx scripts/export-seed-data.ts` (repository root), then seed |

Services in `docker-compose.yml`: `app` (API), `scheduler` (scheduled jobs), `db` (Postgres 17).

## What lives where

| Area | Code |
| --- | --- |
| Catalog API and storefront cache invalidation | `Api/ProductController`, `Api/CategoryController`, `Observers/CatalogObserver`, `Services/StorefrontRevalidator` |
| Sign-in, registration, password reset | `Api/AuthController`, `Api/PasswordResetController` |
| Checkout, order lifecycle, stock | `Services/Checkout/OrderService` |
| Card payments | `Services/Payments/StripeGateway`, `Api/StripeWebhookController` |
| Commissions, ranks, payouts | `Services/Hellobee/*` |
| Back office | `Api/Admin/*` |

Rules worth knowing before changing things:

- Prices, totals and stock are computed in `OrderService` from the database, in integer cents.
  Nothing the client sends about money is trusted.
- An order becomes paid only through `OrderService::markPaid` (Stripe webhook or an administrator).
  Commissions are created there and nowhere else.
- Catalog changes must go through Eloquent models so `CatalogObserver` can refresh the storefront.
- `role` and `status` on `User` are never mass assignable.

## Configuration

See `.env.example` for the full list. The ones that matter in production:

| Variable | Purpose |
| --- | --- |
| `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` | Standard Laravel. `APP_KEY` also encrypts bank account numbers and saved tax calculations: losing it makes them unreadable. |
| `DB_*` | Postgres connection. |
| `STOREFRONT_URL` | Public storefront origin. Used in password-reset links, Stripe return URLs and CORS. |
| `STOREFRONT_REVALIDATE_URL`, `STOREFRONT_REVALIDATE_SECRET` | `<storefront>/api/revalidate` and the secret shared with the storefront's `REVALIDATE_SECRET`. |
| `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` | Card payments. Use a restricted key. Without them only cash on delivery and bank transfer are offered. |
| `MAIL_*` | Needed for password-reset emails (the default `log` mailer only writes them to the log). |
| `LOG_CHANNEL=stderr` | Recommended in containers. Every line carries the `request_id` also returned in `X-Request-Id`. |
| `SEED_DEMO_PASSWORD` | Leave empty. Only for demo environments. |

## Production checklist

- Serve the app with a real PHP server (FrankenPHP, or nginx + php-fpm). The Dockerfile here runs
  `artisan serve` and is for development only.
- Run `php artisan migrate --force` on deploy, then `php artisan config:cache route:cache`.
- Run the scheduler: `* * * * * php artisan schedule:run`. It releases abandoned card orders and
  prunes expired tokens.
- Point a Stripe webhook at `/api/v1/stripe/webhook` for `checkout.session.completed`,
  `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and
  `checkout.session.expired`.
- Monitor `GET /api/v1/health`.
- Back up the database and keep `APP_KEY` somewhere safe.
- Do not run the seeder against production data: it loads the demo catalog and demo accounts.
