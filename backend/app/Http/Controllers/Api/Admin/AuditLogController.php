<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->query('limit', 50), 1), 500);
        $logs = AuditLog::with('user')->latest('id')->limit($limit)->get();

        return response()->json(['data' => $logs->map(fn (AuditLog $log) => [
            'id' => $log->id,
            'user' => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name, 'email' => $log->user->email] : null,
            'action' => $log->action,
            'entity_type' => $log->entity_type,
            'entity_id' => $log->entity_id,
            'details' => $log->details,
            'timestamp' => $log->created_at?->toIso8601String(),
        ])]);
    }

    /** Lets the storefront's own admin tools (tax rule management) write to the same trail. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9_.]+$/'],
            'entity_type' => ['required', 'string', 'max:64'],
            'entity_id' => ['nullable', 'string', 'max:64'],
            'details' => ['nullable', 'array'],
        ]);

        $log = AuditLog::record($request->user(), $data['action'], $data['entity_type'], $data['entity_id'] ?? null, $data['details'] ?? []);

        return response()->json(['data' => ['id' => $log->id]], 201);
    }
}
