<?php

namespace App\Http\Resources;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Event */
class EventResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'title' => $this->title,
            'category' => $this->category,
            'date' => $this->date?->format('Y-m-d') ?? (string) $this->getRawOriginal('date'),
            'time' => $this->time ?? '',
            'location' => $this->location,
            'description' => $this->description ?? '',
            'meaning' => $this->meaning ?? '',
            'image' => $this->image,
        ];
    }
}
