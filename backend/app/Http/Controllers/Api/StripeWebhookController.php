<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Checkout\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

/**
 * Stripe is the only source of truth for whether a card payment succeeded: orders are confirmed
 * here, never from the page the buyer lands on. Handlers are idempotent because Stripe retries.
 */
class StripeWebhookController extends Controller
{
    public function __invoke(Request $request, OrderService $orders): JsonResponse
    {
        $secret = config('services.stripe.webhook_secret');
        abort_unless($secret, 503, 'Stripe webhooks are not configured.');

        try {
            $event = Webhook::constructEvent($request->getContent(), (string) $request->header('Stripe-Signature'), $secret);
        } catch (SignatureVerificationException|UnexpectedValueException) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        $session = $event->data->object;
        $order = in_array($event->type, self::HANDLED, true)
            ? Order::where('stripe_session_id', $session->id)->first()
            : null;

        if (! $order) {
            // Not ours, or an event type we do not act on. Acknowledge so Stripe stops retrying.
            return response()->json(['received' => true]);
        }

        Log::info('Stripe webhook', ['type' => $event->type, 'order' => $order->number, 'event' => $event->id]);

        match ($event->type) {
            // With delayed payment methods the session completes before the money arrives.
            'checkout.session.completed', 'checkout.session.async_payment_succeeded' => $session->payment_status !== 'unpaid'
                ? $this->confirm($orders, $order, (int) $session->amount_total)
                : null,
            'checkout.session.async_payment_failed' => $orders->cancelUnpaid($order, 'Payment failed.'),
            'checkout.session.expired' => $orders->cancelUnpaid($order, 'Payment page expired before payment.'),
        };

        return response()->json(['received' => true]);
    }

    private const HANDLED = [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed',
        'checkout.session.expired',
    ];

    private function confirm(OrderService $orders, Order $order, int $amountPaid): void
    {
        if ($amountPaid !== OrderService::toCents($order->total)) {
            Log::critical('Stripe amount does not match the order total', [
                'order' => $order->number,
                'expected' => OrderService::toCents($order->total),
                'paid' => $amountPaid,
            ]);

            return;
        }

        $orders->markPaid($order);
    }
}
