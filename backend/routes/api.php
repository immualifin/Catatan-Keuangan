<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Categories
    Route::apiResource('categories', CategoryController::class)->except(['show']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);

    // Receipts / Scan Struk
    Route::post('/receipts/upload', [ReceiptController::class, 'upload']);
    Route::post('/receipts/{receipt}/process', [ReceiptController::class, 'process']);
    Route::post('/receipts/{receipt}/confirm', [ReceiptController::class, 'confirm']);
    Route::get('/receipts/{receipt}', [ReceiptController::class, 'show']);

    // Reports
    Route::get('/reports/export/csv', [ReportController::class, 'exportCsv']);
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
});
