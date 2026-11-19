<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\HellobeeMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const MAX_LOGIN_ATTEMPTS = 5;

    private const MAX_ACCOUNT_ATTEMPTS = 20;

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:32'],
            'password' => ['required', 'string', 'max:255', Password::defaults()],
            'sponsor_code' => ['nullable', 'string', 'max:32'],
        ]);

        $sponsorCode = isset($data['sponsor_code']) ? Str::upper(trim((string) $data['sponsor_code'])) : '';
        if ($sponsorCode !== '') {
            if (! HellobeeMember::where('referral_code', $sponsorCode)->where('is_active', true)->exists()) {
                throw ValidationException::withMessages(['sponsor_code' => 'Referral code not found or inactive.']);
            }
            $data['sponsor_code'] = $sponsorCode;
        } else {
            unset($data['sponsor_code']);
        }

        // Role and status come from column defaults; they are never taken from the request.
        $user = User::create($data);

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $email = Str::lower($credentials['email']);
        // Requests arrive through the storefront server, which forwards the real visitor address.
        // One visitor is locked out quickly; a wider per-account cap still stops slow guessing
        // without letting a stranger lock the owner out with a handful of bad tries.
        $clientIp = (string) $request->header('X-Client-Ip', $request->ip());
        $throttleKey = 'login:'.sha1($email.'|'.$clientIp);
        $accountKey = 'login-account:'.sha1($email);

        foreach ([[$throttleKey, self::MAX_LOGIN_ATTEMPTS], [$accountKey, self::MAX_ACCOUNT_ATTEMPTS]] as [$key, $max]) {
            if (RateLimiter::tooManyAttempts($key, $max)) {
                throw ValidationException::withMessages([
                    'email' => __('auth.throttle', ['seconds' => RateLimiter::availableIn($key)]),
                ])->status(429);
            }
        }

        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password) || ! $user->isActive()) {
            RateLimiter::hit($throttleKey, 60);
            RateLimiter::hit($accountKey, 900);

            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        RateLimiter::clear($throttleKey);
        RateLimiter::clear($accountKey);

        return $this->tokenResponse($user);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load(['addresses', 'hellobeeMember']));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        $minutes = config('sanctum.expiration');
        $token = $user->createToken('storefront', ['*'], $minutes ? now()->addMinutes($minutes) : null);

        return response()->json([
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at?->toIso8601String(),
            'user' => new UserResource($user->load(['addresses', 'hellobeeMember'])),
        ], $status);
    }
}
