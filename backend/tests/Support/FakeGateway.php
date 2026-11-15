<?php

namespace Tests\Support;

use App\Models\Order;
use App\Services\Payments\PaymentGateway;
use RuntimeException;

class FakeGateway implements PaymentGateway
{
    public bool $available = true;

    public bool $fail = false;

    private int $sessions = 0;

    public function isAvailable(): bool
    {
        return $this->available;
    }

    public function createCheckout(Order $order): array
    {
        if ($this->fail) {
            throw new RuntimeException('Stripe is down.');
        }

        $id = 'cs_test_'.++$this->sessions;

        return ['id' => $id, 'url' => "https://pay.test/{$id}"];
    }

    public function checkoutUrl(string $sessionId): ?string
    {
        return "https://pay.test/{$sessionId}";
    }
}
