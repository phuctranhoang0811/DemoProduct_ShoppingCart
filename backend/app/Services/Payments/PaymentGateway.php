<?php

namespace App\Services\Payments;

use App\Models\Order;

interface PaymentGateway
{
    public function isAvailable(): bool;

    /**
     * Opens a hosted payment page for the order.
     *
     * @return array{id: string, url: string}
     */
    public function createCheckout(Order $order): array;

    /** URL of a payment page that is still open, or null once it is finished or expired. */
    public function checkoutUrl(string $sessionId): ?string;
}
