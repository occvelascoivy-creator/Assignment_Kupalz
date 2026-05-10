<?php

namespace App\Http\Controllers;

use App\Models\User;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function user(Request $request)
    {
        return $request->user();
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'unique:users,email'],
            'profile_image' => ['required', 'image', 'mimes:jpg,jpeg,png'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $image_url = $request->file('profile_image')->store('users', 'public');

        User::create([
            'name' => $request->name,
            'profile_image' => $image_url,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Register successfully!'
        ], 200);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required']
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'The provided credentials are incorrect.'], 422);
        }

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'message' => 'Login successfully!',
            'user' => $user
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successfully!'
        ], 200);
    }

    // Update profile without image
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'unique:users,email,' . $user->id],
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user
        ], 200);
    }

    // NEW: Update only profile image
    public function updateProfileImage(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'profile_image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        // Delete old image
        if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
            Storage::disk('public')->delete($user->profile_image);
        }
        
        // Store new image
        $image_url = $request->file('profile_image')->store('users', 'public');
        $user->profile_image = $image_url;
        $user->save();

        return response()->json([
            'message' => 'Profile image updated successfully!',
            'user' => $user
        ], 200);
    }

    public function removeProfileImage(Request $request)
    {
        $user = $request->user();
        
        if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
            Storage::disk('public')->delete($user->profile_image);
            $user->profile_image = null;
            $user->save();
        }
        
        return response()->json([
            'message' => 'Profile image removed successfully!',
            'user' => $user
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.'
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully!'
        ], 200);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
            Storage::disk('public')->delete($user->profile_image);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully!'
        ], 200);
    }
}