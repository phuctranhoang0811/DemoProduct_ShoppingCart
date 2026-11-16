<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => Setting::pluck('value', 'key')]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name' => ['sometimes', 'string', 'max:255'],
            'store_description' => ['sometimes', 'string', 'max:1000'],
            'contact_email' => ['sometimes', 'email', 'max:255'],
            'contact_phone' => ['sometimes', 'string', 'max:64'],
            'shipping_fee' => ['sometimes', 'numeric', 'min:0', 'max:100000'],
            'free_shipping_threshold' => ['sometimes', 'numeric', 'min:0', 'max:10000000'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'announcement_text' => ['sometimes', 'string', 'max:500'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0', 'max:100000'],
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        AuditLog::record($request->user(), 'settings.updated', 'Setting', null, ['fields' => array_keys($data)]);

        return $this->show();
    }
}
