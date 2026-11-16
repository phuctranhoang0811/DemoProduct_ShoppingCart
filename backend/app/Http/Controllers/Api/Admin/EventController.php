<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\AuditLog;
use App\Models\Event;
use App\Support\MediaPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    private const CATEGORIES = ['Community', 'Training', 'Wellness', 'Leadership'];

    private const DEFAULT_IMAGE = '/images/events/campfire.webp';

    public function index(): AnonymousResourceCollection
    {
        return EventResource::collection(Event::orderBy('date')->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(self::CATEGORIES)],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['nullable', 'string', 'max:64'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:4000'],
            'meaning' => ['nullable', 'string', 'max:4000'],
            'image' => ['nullable', 'string', MediaPath::eventImage()],
        ]);

        $event = Event::create([
            'public_id' => 'evt-'.Str::lower(Str::random(10)),
            'title' => trim($data['title']),
            'category' => $data['category'],
            'date' => $data['date'],
            'time' => trim((string) ($data['time'] ?? '')),
            'location' => trim($data['location']),
            'description' => trim((string) ($data['description'] ?? '')),
            'meaning' => trim((string) ($data['meaning'] ?? '')),
            'image' => $data['image'] ?: self::DEFAULT_IMAGE,
        ]);

        AuditLog::record($request->user(), 'event.created', 'Event', $event->public_id, ['title' => $event->title]);

        return (new EventResource($event))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $event->delete();

        AuditLog::record($request->user(), 'event.deleted', 'Event', $event->public_id, ['title' => $event->title]);

        return response()->json(['message' => 'Event deleted.']);
    }
}
