<?php

namespace App\Services\Checkout;

use App\Models\Discount;
use App\Models\HellobeeMember;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Setting;
use App\Models\User;
use App\Services\Hellobee\CommissionService;
use App\Services\Payments\PaymentGateway;
use App\Services\StorefrontRevalidator;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Owns the order lifecycle. Every amount is computed here from database prices; nothing the
 * client sends about prices, totals or stock is trusted. Money is handled in integer cents.
 */
class OrderService
{
    public function __construct(
        private PaymentGateway $payments,
        private StorefrontRevalidator $storefront,
        private CommissionService $commissions,
    ) {}

    /**
     * Prices a cart without creating anything.
     *
     * @param  array<int, array{product_id: string, size: string, color_id?: string|null, quantity: int}>  $items
     * @return array{lines: array<int, array<string, mixed>>, subtotal: int, discount: int, discount_code: ?string, shipping: int, total: int}
     */
    public function quote(array $items, ?string $discountCode = null, bool $lock = false): array
    {
        $lines = $this->resolveLines($items, $lock);
        $subtotal = array_sum(array_map(fn ($line) => $line['unit_price'] * $line['quantity'], $lines));

        $discount = $discountCode ? $this->resolveDiscount($discountCode, $subtotal, $lock) : null;
        $discountAmount = $discount ? $this->discountAmount($discount, $subtotal) : 0;

        $shipping = $this->shippingFee($subtotal - $discountAmount);

        return [
            'lines' => $lines,
            'subtotal' => $subtotal,
            'discount' => $discountAmount,
            'discount_code' => $discount?->code,
            'discount_model' => $discount,
            'shipping' => $shipping,
            'total' => $subtotal - $discountAmount + $shipping,
        ];
    }

    /**
     * Places an order: reserves stock, records the order and, for card payments, opens a
     * hosted payment page. Returns the order and the URL to send the buyer to, if any.
     *
     * @param  array<string, mixed>  $data  validated checkout payload
     * @return array{order: Order, checkout_url: ?string, created: bool}
     */
    public function place(array $data, ?User $user): array
    {
        if ($data['payment_method'] === 'stripe' && ! $this->payments->isAvailable()) {
            throw ValidationException::withMessages(['payment_method' => 'Card payments are not available right now.']);
        }

        if ($existing = $this->findByIdempotencyKey($data['idempotency_key'] ?? null)) {
            return ['order' => $existing, 'checkout_url' => $this->resumeUrl($existing), 'created' => false];
        }

        try {
            $order = DB::transaction(fn () => $this->createOrder($data, $user));
        } catch (UniqueConstraintViolationException $e) {
            // Two identical submissions raced; the other one won.
            if ($existing = $this->findByIdempotencyKey($data['idempotency_key'] ?? null)) {
                return ['order' => $existing, 'checkout_url' => $this->resumeUrl($existing), 'created' => false];
            }
            throw $e;
        }

        $this->refreshStorefrontStock($order);

        $checkoutUrl = null;

        if ($order->payment_method === 'stripe') {
            try {
                $session = $this->payments->createCheckout($order);
                $order->update(['stripe_session_id' => $session['id']]);
                $checkoutUrl = $session['url'];
            } catch (Throwable $e) {
                Log::error('Could not open the payment page', ['order' => $order->number, 'error' => $e->getMessage()]);
                $this->cancelUnpaid($order, 'Payment page could not be opened.');

                throw ValidationException::withMessages([
                    'payment_method' => 'We could not start the card payment. Please try again or choose another method.',
                ]);
            }
        }

        return ['order' => $order->fresh(['items', 'statusHistory']), 'checkout_url' => $checkoutUrl, 'created' => true];
    }

    /**
     * Records a confirmed payment. Safe to call more than once for the same order.
     */
    public function markPaid(Order $order): void
    {
        DB::transaction(function () use ($order): void {
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status === 'Paid') {
                return;
            }

            if ($order->status === 'Cancelled') {
                // Money arrived for an order we already released; a person has to sort this out.
                Log::critical('Payment received for a cancelled order', ['order' => $order->number]);
                $order->update(['payment_status' => 'Paid', 'paid_at' => now()]);
                $order->statusHistory()->create(['status' => 'Cancelled', 'note' => 'Payment received after cancellation; needs review.']);

                return;
            }

            $order->update([
                'payment_status' => 'Paid',
                'paid_at' => now(),
                // A paid order that staff already moved along keeps its fulfilment status.
                'status' => $order->status === 'Pending' ? 'Confirmed' : $order->status,
            ]);
            $order->statusHistory()->create(['status' => $order->status, 'note' => 'Payment received.']);

            $this->commissions->awardForOrder($order);
        });
    }

    public const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    /**
     * Moves an order along its fulfilment path. Cancelling returns the stock; a cancelled order
     * stays cancelled, because its stock may already have been sold to someone else.
     */
    public function updateStatus(Order $order, string $status, ?string $note = null): void
    {
        if ($order->status === 'Cancelled') {
            throw ValidationException::withMessages(['status' => 'A cancelled order cannot be reopened.']);
        }

        if ($status === 'Cancelled') {
            $this->cancel($order, $note ?: 'Cancelled by staff.');

            return;
        }

        if ($status === $order->status) {
            return;
        }

        DB::transaction(function () use ($order, $status, $note): void {
            $order->update(['status' => $status]);
            $order->statusHistory()->create(['status' => $status, 'note' => $note]);
        });
    }

    /**
     * Records that a paid order's money went back to the buyer and takes back its commissions.
     * The refund itself is issued in the payment provider; this keeps the books in step with it.
     */
    public function refund(Order $order, ?string $note = null): void
    {
        DB::transaction(function () use ($order, $note): void {
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status !== 'Paid') {
                throw ValidationException::withMessages(['payment_status' => 'Only a paid order can be refunded.']);
            }

            $order->update(['payment_status' => 'Refunded']);
            $order->statusHistory()->create(['status' => $order->status, 'note' => $note ?: 'Payment refunded.']);
            $this->commissions->revokeForOrder($order);
        });
    }

    /**
     * Cancels an order that was never paid and puts its stock back. Safe to call repeatedly.
     */
    public function cancelUnpaid(Order $order, string $reason): void
    {
        $this->cancel($order, $reason, onlyIfUnpaid: true);
    }

    /** Cancels an order and returns its stock. Payment is not touched: refund a paid order separately. */
    public function cancel(Order $order, string $reason, bool $onlyIfUnpaid = false): void
    {
        DB::transaction(function () use ($order, $reason, $onlyIfUnpaid): void {
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->status === 'Cancelled' || ($onlyIfUnpaid && $order->payment_status !== 'Unpaid')) {
                return;
            }

            foreach ($order->items()->orderBy('product_id')->get() as $item) {
                $size = ProductSize::where('product_id', $item->product_id)
                    ->where('label', $item->size)
                    ->lockForUpdate()
                    ->first();

                if (! $size) {
                    continue;
                }

                $previous = $size->stock;
                $size->increment('stock', $item->quantity);
                $this->recordMovement($item->product_id, $item->product_name, $item->size, $item->color_name, $item->quantity, $previous, "Order {$order->number} cancelled");
            }

            if ($order->discount_code) {
                Discount::where('code', $order->discount_code)->where('used_count', '>', 0)->decrement('used_count');
            }

            if ($order->payment_status === 'Paid') {
                $this->commissions->revokeForOrder($order);
            }

            $order->update(['status' => 'Cancelled']);
            $order->statusHistory()->create(['status' => 'Cancelled', 'note' => $reason]);
        });

        $this->refreshStorefrontStock($order);
    }

    /** Stock moved, so the cached product pages (availability, structured data) are stale. */
    private function refreshStorefrontStock(Order $order): void
    {
        $this->storefront->queue('catalog', ...$order->items()->pluck('slug')->unique()->map(fn (string $slug) => "product:{$slug}"));
    }

    /** @param  array<string, mixed>  $data */
    private function createOrder(array $data, ?User $user): Order
    {
        $quote = $this->quote($data['items'], $data['discount_code'] ?? null, lock: true);

        $order = Order::create([
            'number' => $this->newOrderNumber(),
            'user_id' => $user?->id,
            'customer_name' => $data['customer']['name'],
            'customer_email' => Str::lower($data['customer']['email']),
            'customer_phone' => $data['customer']['phone'],
            'shipping_street' => $data['shipping_address']['street'],
            'shipping_ward' => $data['shipping_address']['ward'] ?? null,
            'shipping_district' => $data['shipping_address']['district'] ?? null,
            'shipping_city' => $data['shipping_address']['city'],
            'shipping_postal_code' => $data['shipping_address']['postal_code'] ?? null,
            'delivery_method' => $data['delivery_method'] ?? 'Standard Delivery',
            'payment_method' => $data['payment_method'],
            'payment_status' => 'Unpaid',
            'status' => 'Pending',
            'subtotal' => self::toDecimal($quote['subtotal']),
            'discount_amount' => self::toDecimal($quote['discount']),
            'discount_code' => $quote['discount_code'],
            'shipping_fee' => self::toDecimal($quote['shipping']),
            'total' => self::toDecimal($quote['total']),
            'referral_code' => $this->resolveReferralCode($data['referral_code'] ?? null, $user),
            'notes' => $data['notes'] ?? null,
            'idempotency_key' => $data['idempotency_key'] ?? null,
            'guest_token' => Str::random(48),
        ]);

        foreach ($quote['lines'] as $line) {
            /** @var ProductSize $size */
            $size = $line['size_model'];
            $previous = $size->stock;
            $size->decrement('stock', $line['quantity']);

            $order->items()->create([
                'product_id' => $line['product_model']->id,
                'product_name' => $line['name'],
                'slug' => $line['slug'],
                'image' => $line['image'],
                'price' => self::toDecimal($line['unit_price']),
                'color_name' => $line['color_name'],
                'size' => $line['size'],
                'quantity' => $line['quantity'],
            ]);

            $this->recordMovement($line['product_model']->id, $line['name'], $line['size'], $line['color_name'], -$line['quantity'], $previous, "Order {$order->number} placed");
        }

        $quote['discount_model']?->increment('used_count');

        $order->statusHistory()->create(['status' => 'Pending', 'note' => 'Order placed.']);

        return $order;
    }

    /**
     * @param  array<int, array{product_id: string, size: string, color_id?: string|null, quantity: int}>  $items
     * @return array<int, array<string, mixed>>
     */
    private function resolveLines(array $items, bool $lock): array
    {
        // Merge duplicate lines so one size cannot be oversold by splitting it across rows.
        $merged = [];
        foreach ($items as $item) {
            $key = $item['product_id'].'|'.$item['size'].'|'.($item['color_id'] ?? '');
            $merged[$key] ??= [...$item, 'quantity' => 0];
            $merged[$key]['quantity'] += $item['quantity'];
        }

        $products = Product::active()
            ->whereIn('public_id', array_column($merged, 'product_id'))
            ->with(['images', 'colors'])
            ->get()
            ->keyBy('public_id');

        $requested = [];
        foreach ($merged as $index => $item) {
            $product = $products->get($item['product_id']);
            if (! $product) {
                throw ValidationException::withMessages(['items' => 'One of the products in your cart is no longer available.']);
            }
            $requested[$index] = $product;
        }

        // Lock sizes in a fixed order so concurrent checkouts cannot deadlock.
        $sizes = ProductSize::whereIn('product_id', $products->pluck('id'))
            ->orderBy('id')
            ->when($lock, fn ($query) => $query->lockForUpdate())
            ->get();

        $wantedPerSize = [];
        $lines = [];

        foreach ($merged as $index => $item) {
            $product = $requested[$index];
            $size = $sizes->first(fn (ProductSize $s) => $s->product_id === $product->id && $s->label === $item['size']);

            if (! $size) {
                throw ValidationException::withMessages(['items' => "\"{$product->name}\" is not sold in the selected option."]);
            }

            $wantedPerSize[$size->id] = ($wantedPerSize[$size->id] ?? 0) + $item['quantity'];
            if ($wantedPerSize[$size->id] > $size->stock) {
                throw ValidationException::withMessages([
                    'items' => $size->stock > 0
                        ? "Only {$size->stock} of \"{$product->name}\" ({$size->label}) left in stock."
                        : "\"{$product->name}\" ({$size->label}) is out of stock.",
                ]);
            }

            $color = $product->colors->firstWhere('code', $item['color_id'] ?? null) ?? $product->colors->first();

            $lines[] = [
                'product_id' => $product->public_id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $color?->image ?? $product->images->first()?->url,
                'size' => $size->label,
                'color_name' => $color?->name,
                'unit_price' => self::toCents($product->price),
                'quantity' => $item['quantity'],
                'product_model' => $product,
                'size_model' => $size,
            ];
        }

        return $lines;
    }

    private function resolveDiscount(string $code, int $subtotal, bool $lock): Discount
    {
        $discount = Discount::where('code', Str::upper(trim($code)))
            ->when($lock, fn ($query) => $query->lockForUpdate())
            ->first();

        $error = match (true) {
            ! $discount => 'Promo code not recognized.',
            ! $discount->is_active => 'This promo code is currently inactive.',
            ($discount->starts_at && $discount->starts_at->isFuture()) || ($discount->ends_at && $discount->ends_at->isPast()) => 'This promo code has expired.',
            $discount->usage_limit > 0 && $discount->used_count >= $discount->usage_limit => 'Promo code usage limit has been reached.',
            $subtotal < self::toCents($discount->min_order_amount) => 'Requires a minimum purchase of $'.number_format((float) $discount->min_order_amount, 2).'.',
            default => null,
        };

        if ($error) {
            throw ValidationException::withMessages(['discount_code' => $error]);
        }

        return $discount;
    }

    private function discountAmount(Discount $discount, int $subtotal): int
    {
        if ($discount->type === 'percentage') {
            $amount = intdiv($subtotal * (int) round((float) $discount->value * 100), 10000);
            $cap = $discount->max_discount !== null ? self::toCents($discount->max_discount) : null;

            return $cap !== null ? min($amount, $cap) : $amount;
        }

        return min(self::toCents($discount->value), $subtotal);
    }

    private function shippingFee(int $payable): int
    {
        $fee = self::toCents((string) (Setting::find('shipping_fee')?->value ?? 0));
        $freeFrom = self::toCents((string) (Setting::find('free_shipping_threshold')?->value ?? 0));

        return $fee > 0 && ($freeFrom === 0 || $payable < $freeFrom) ? $fee : 0;
    }

    /**
     * An order is credited to the code typed at checkout, else to the buyer's sponsor.
     * Unknown codes are dropped rather than blocking the purchase.
     */
    private function resolveReferralCode(?string $code, ?User $user): ?string
    {
        foreach ([$code, $user?->sponsor_code] as $candidate) {
            $candidate = Str::upper(trim((string) $candidate));

            if ($candidate !== '' && HellobeeMember::where('referral_code', $candidate)->where('is_active', true)->exists()) {
                return $candidate;
            }
        }

        return null;
    }

    private function recordMovement(?int $productId, string $productName, ?string $size, ?string $colorName, int $change, int $previous, string $reason): void
    {
        InventoryMovement::create([
            'product_id' => $productId,
            'product_name' => $productName,
            'variant_info' => trim(($colorName ?? '').' / '.($size ?? ''), ' /'),
            'change' => $change,
            'previous_stock' => $previous,
            'new_stock' => $previous + $change,
            'reason' => $reason,
            'moved_at' => now(),
        ]);
    }

    private function findByIdempotencyKey(?string $key): ?Order
    {
        return $key ? Order::where('idempotency_key', $key)->with(['items', 'statusHistory'])->first() : null;
    }

    private function resumeUrl(Order $order): ?string
    {
        if ($order->payment_method !== 'stripe' || $order->payment_status !== 'Unpaid' || ! $order->stripe_session_id) {
            return null;
        }

        try {
            return $this->payments->checkoutUrl($order->stripe_session_id);
        } catch (Throwable) {
            return null;
        }
    }

    private function newOrderNumber(): string
    {
        do {
            $number = 'ORD-'.Str::upper(Str::random(8));
        } while (Order::where('number', $number)->exists());

        return $number;
    }

    public static function toCents(string|int|float|null $amount): int
    {
        return (int) bcmul((string) ($amount ?? '0'), '100', 0);
    }

    public static function toDecimal(int $cents): string
    {
        return bcdiv((string) $cents, '100', 2);
    }
}
