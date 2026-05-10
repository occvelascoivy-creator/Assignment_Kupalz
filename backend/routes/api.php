<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Blog routes
    Route::post('/create/blog', [BlogController::class, 'createBlog']);
    Route::get('/fetchBlogs', [BlogController::class, 'fetchBlogs']);
    Route::get('/blogs/{id}', [BlogController::class, 'show']);
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);
    
    // User profile routes
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/profile-image', [AuthController::class, 'updateProfileImage']); // NEW: for image upload only
    Route::delete('/user/profile-image', [AuthController::class, 'removeProfileImage']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::delete('/user/account', [AuthController::class, 'deleteAccount']);
});