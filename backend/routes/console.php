<?php

use Illuminate\Support\Facades\Schedule;

// Run by `php artisan schedule:work` (the `scheduler` service) or a one-minute cron in production.
Schedule::command('orders:release-stale')->everyFifteenMinutes()->withoutOverlapping();
Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('auth:clear-resets')->daily();
