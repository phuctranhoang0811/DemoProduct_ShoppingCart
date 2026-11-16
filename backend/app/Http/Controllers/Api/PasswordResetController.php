<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    public function sendLink(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'string', 'email', 'max:255']]);

        Password::sendResetLink(['email' => Str::lower($data['email'])]);

        // Same answer whether or not the address has an account, so it cannot be used to probe for users.
        return response()->json(['message' => 'If that email is registered, a reset link is on its way.']);
    }

    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            [...$data, 'email' => Str::lower($data['email'])],
            function (User $user, string $password): void {
                $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
                // A reset signs the account out everywhere.
                $user->tokens()->delete();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return response()->json(['message' => 'Your password has been reset.']);
    }
}
