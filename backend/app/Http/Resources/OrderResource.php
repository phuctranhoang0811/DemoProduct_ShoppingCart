<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'number' => $this->number,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'shipping_address' => [
                'street' => $this->shipping_street,
                'ward' => $this->shipping_ward,
                'district' => $this->shipping_district,
                'city' => $this->shipping_city,
            ],
            'delivery_method' => $this->delivery_method,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            'items' => $this->items->map(fn ($item) => [
                'product_id' => $item->product?->public_id,
                'product_name' => $item->product_name,
                'slug' => $item->slug,
                'image' => $item->image,
                'price' => (float) $item->price,
                'color_name' => $item->color_name,
                'size' => $item->size,
                'quantity' => $item->quantity,
            ]),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'discount_code' => $this->discount_code,
            'shipping_fee' => (float) $this->shipping_fee,
            'total' => (float) $this->total,
            'referral_code' => $this->referral_code,
            'notes' => $this->notes,
            'status_history' => $this->statusHistory->map(fn ($entry) => [
                'status' => $entry->status,
                'note' => $entry->note,
                'timestamp' => $entry->created_at?->toIso8601String(),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
