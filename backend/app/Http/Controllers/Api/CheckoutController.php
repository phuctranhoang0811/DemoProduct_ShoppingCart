<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Checkout\OrderService;
use App\Services\Payments\PaymentGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class CheckoutController extends Controller
{
    private const ORDER_RELATIONS = ['items.product', 'statusHistory'];

    public function __construct(private OrderService $orders) {}

    public function config(PaymentGateway $payments): JsonResponse
    {
        return response()->json([
            'payment_methods' => array_values(array_filter([
                $payments->isAvailable() ? 'stripe' : null,
                'cod',
                'bank_transfer',
            ])),
        ]);
    }

    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate([...$this->itemRules(), 'discount_code' => ['nullable', 'string', 'max:32']]);

        $quote = $this->orders->quote($data['items'], $data['discount_code'] ?? null);

        return response()->json([
            'lines' => array_map(fn ($line) => [
                'product_id' => $line['product_id'],
                'name' => $line['name'],
                'size' => $line['size'],
                'unit_price' => $line['unit_price'] / 100,
                'quantity' => $line['quantity'],
            ], $quote['lines']),
            'subtotal' => $quote['subtotal'] / 100,
            'discount_amount' => $quote['discount'] / 100,
            'discount_code' => $quote['discount_code'],
            'shipping_fee' => $quote['shipping'] / 100,
            'total' => $quote['total'] / 100,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            ...$this->itemRules(),
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.email' => ['required', 'string', 'email', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:32'],
            'shipping_address.street' => ['required', 'string', 'max:255'],
            'shipping_address.ward' => ['nullable', 'string', 'max:255'],
            'shipping_address.district' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:255'],
            'shipping_address.postal_code' => ['nullable', 'string', 'max:32'],
            'delivery_method' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', Rule::in(['stripe', 'cod', 'bank_transfer'])],
            'discount_code' => ['nullable', 'string', 'max:32'],
            'referral_code' => ['nullable', 'string', 'max:32'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'uuid'],
        ]);

        $result = $this->orders->place($data, $request->user('sanctum'));
        $order = $result['order']->loadMissing(self::ORDER_RELATIONS);

        return response()->json([
            'order' => new OrderResource($order),
            'checkout_url' => $result['checkout_url'],
            // Lets the buyer open this one order again without an account.
            'access_token' => $order->guest_token,
        ], $result['created'] ? 201 : 200);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return OrderResource::collection(
            $request->user()->orders()->with(self::ORDER_RELATIONS)->latest()->paginate(50)
        );
    }

    public function show(Request $request, string $number): OrderResource
    {
        $order = Order::where('number', $number)->with(self::ORDER_RELATIONS)->firstOrFail();
        $user = $request->user('sanctum');
        $token = (string) $request->query('token');

        $allowed = ($user && $order->user_id === $user->id)
            || ($user && $user->isActive() && $user->hasRole('admin', 'employee'))
            || ($token !== '' && $order->guest_token && hash_equals($order->guest_token, $token));

        // 404 rather than 403 so order numbers cannot be probed.
        abort_unless($allowed, 404);

        return new OrderResource($order);
    }

    /** Staff confirm payment for cash-on-delivery and bank-transfer orders. */
    public function markPaid(string $number): OrderResource
    {
        $order = Order::where('number', $number)->firstOrFail();

        abort_if($order->status === 'Cancelled', 422, 'A cancelled order cannot be marked as paid.');

        $this->orders->markPaid($order);

        return new OrderResource($order->fresh(self::ORDER_RELATIONS));
    }

    /** @return array<string, mixed> */
    private function itemRules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'string', 'max:64'],
            'items.*.size' => ['required', 'string', 'max:255'],
            'items.*.color_id' => ['nullable', 'string', 'max:64'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}
