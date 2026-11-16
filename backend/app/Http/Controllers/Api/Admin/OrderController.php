<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\AuditLog;
use App\Models\Order;
use App\Services\Checkout\OrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const RELATIONS = ['items.product', 'statusHistory'];

    public function __construct(private OrderService $orders) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return OrderResource::collection(
            $this->visibleTo($request)->with(self::RELATIONS)->latest()->paginate(200)
        );
    }

    public function updateStatus(Request $request, string $number): OrderResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(OrderService::STATUSES)],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $order = $this->visibleTo($request)->where('number', $number)->firstOrFail();
        $from = $order->status;

        $this->orders->updateStatus($order, $data['status'], $data['note'] ?? null);
        AuditLog::record($request->user(), 'order.status_changed', 'Order', $order->number, ['from' => $from, 'to' => $data['status']]);

        return new OrderResource($order->fresh(self::RELATIONS));
    }

    public function refund(Request $request, string $number): OrderResource
    {
        $data = $request->validate(['note' => ['nullable', 'string', 'max:255']]);
        $order = Order::where('number', $number)->firstOrFail();

        $this->orders->refund($order, $data['note'] ?? null);
        AuditLog::record($request->user(), 'order.refunded', 'Order', $order->number, ['total' => $order->total]);

        return new OrderResource($order->fresh(self::RELATIONS));
    }

    /**
     * Administrators work with every order. A consultant only with orders credited to their own code.
     *
     * @return Builder<Order>
     */
    private function visibleTo(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return Order::query();
        }

        $code = $user->hellobeeMember?->referral_code;

        return Order::query()->where('referral_code', $code ?? '__none__');
    }
}
