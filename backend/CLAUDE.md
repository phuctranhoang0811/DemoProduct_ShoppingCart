# Backend notes for developers and AI agents

This is the Laravel API for the storefront in the repository root. Read `README.md` in this folder
first: it covers setup, where things live, and the rules that must not be broken.

- PHP and Composer run inside Docker only. Do not install them on the host. Prefix commands with
  `docker compose exec app`, for example `docker compose exec app php artisan test`.
- Run the tests and `./vendor/bin/pint` before finishing a change.
- The repository is English-only (see the root `AGENTS.md`).
