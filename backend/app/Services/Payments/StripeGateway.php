<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Services\Checkout\OrderService;
use Stripe\StripeClient;

/**
 * Card payments through Stripe-hosted Checkout. Card details never touch this application.
 */
class StripeGateway implements PaymentGateway
{
    // Tags these sessions in the Stripe Dashboard so this checkout flow can be told apart.
    private const INTEGRATION_IDENTIFIER = 'hellobee_storefront_checkout_qkzvnhtr';

    private const SESSION_LIFETIME_MINUTES = 31;

    private ?StripeClient $client = null;

    public function isAvailable(): bool
    {
        return (bool) config('services.stripe.enabled') && (bool) config('services.stripe.secret');
    }

    public function createCheckout(Order $order): array
    {
        $storefront = rtrim((string) config('services.storefront.url'), '/');

        $session = $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'client_reference_id' => $order->number,
            'customer_email' => $order->customer_email,
            // The order total was computed server-side; a single line keeps Stripe's amount identical to ours.
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => config('services.stripe.currency'),
                    'unit_amount' => OrderService::toCents($order->total),
                    'product_data' => ['name' => "Order {$order->number}"],
                ],
            ]],
            'metadata' => ['order_number' => $order->number],
            'payment_intent_data' => ['metadata' => ['order_number' => $order->number]],
            'integration_identifier' => self::INTEGRATION_IDENTIFIER,
            // Stock is held while the page is open, so the hold is kept short.
            'expires_at' => now()->addMinutes(self::SESSION_LIFETIME_MINUTES)->timestamp,
            'success_url' => $storefront.'/order-success?'.http_build_query(['order' => $order->number, 'token' => $order->guest_token]),
            'cancel_url' => $storefront.'/checkout?'.http_build_query(['cancelled' => $order->number]),
        ], ['idempotency_key' => "checkout-{$order->number}"]);

        return ['id' => $session->id, 'url' => $session->url];
    }

    public function checkoutUrl(string $sessionId): ?string
    {
        $session = $this->client()->checkout->sessions->retrieve($sessionId);

        return $session->status === 'open' ? $session->url : null;
    }

    private function client(): StripeClient
    {
        return $this->client ??= new StripeClient(['api_key' => (string) config('services.stripe.secret')]);
    }
}
