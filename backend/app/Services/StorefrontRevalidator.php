<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

use function Illuminate\Support\defer;

/**
 * Tells the Next.js storefront which cached pages are stale.
 * Tags are collected during the request and sent in one call after the response.
 */
class StorefrontRevalidator
{
    /** @var array<string, true> */
    private array $pending = [];

    public function queue(string ...$tags): void
    {
        if (! config('services.storefront.revalidate_url')) {
            return;
        }

        if ($this->pending === []) {
            defer(fn () => $this->flush(), 'storefront-revalidate');
        }

        foreach ($tags as $tag) {
            $this->pending[$tag] = true;
        }
    }

    public function flush(): void
    {
        $tags = array_keys($this->pending);
        $this->pending = [];

        if ($tags === []) {
            return;
        }

        try {
            Http::timeout(5)
                ->withHeaders(['X-Revalidate-Secret' => (string) config('services.storefront.revalidate_secret')])
                ->post(config('services.storefront.revalidate_url'), ['tags' => $tags])
                ->throw();
        } catch (Throwable $e) {
            // A failed ping must never break a catalog write; pages still expire on their own schedule.
            Log::warning('Storefront revalidation failed', ['tags' => $tags, 'error' => $e->getMessage()]);
        }
    }
}
