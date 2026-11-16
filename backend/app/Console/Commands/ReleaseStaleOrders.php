<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\Checkout\OrderService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Safety net for card orders whose payment page was abandoned and whose "expired" webhook never
 * arrived. Without it their stock would stay reserved forever.
 */
#[Signature('orders:release-stale {--minutes=120 : Age after which an unpaid card order is released}')]
#[Description('Cancel unpaid card orders that were abandoned and return their stock')]
class ReleaseStaleOrders extends Command
{
    public function handle(OrderService $orders): int
    {
        $stale = Order::where('payment_method', 'stripe')
            ->where('payment_status', 'Unpaid')
            ->where('status', 'Pending')
            ->where('created_at', '<', now()->subMinutes((int) $this->option('minutes')))
            ->get();

        foreach ($stale as $order) {
            $orders->cancelUnpaid($order, 'Payment was not completed in time.');
            $this->line("Released {$order->number}");
        }

        $this->info("{$stale->count()} stale order(s) released.");

        return self::SUCCESS;
    }
}
