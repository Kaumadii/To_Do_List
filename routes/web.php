<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 1) SPA entry for root
Route::view('/', 'welcome');

// 2) API routes (must come BEFORE catch-all)
Route::prefix('api')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::get('/me',        [AuthController::class, 'me']);

    // Tasks
    Route::get('/tasks/latest',        [TaskController::class, 'latest']);
    Route::get('/tasks/deleted',       [TaskController::class, 'deleted']);
    Route::get('/tasks',               [TaskController::class, 'index']);
    Route::post('/tasks',              [TaskController::class, 'store']);
    Route::put('/tasks/{task}',        [TaskController::class, 'update']);
    Route::delete('/tasks/{task}',     [TaskController::class, 'destroy']);
    Route::post('/tasks/{id}/restore', [TaskController::class, 'restore']);
    Route::delete('/tasks/{id}/force', [TaskController::class, 'forceDelete']);
});

// 3) Catch-all for React SPA, but EXCLUDE any path that starts with "api"
Route::view('/{any}', 'welcome')->where('any', '^(?!api).*$');

