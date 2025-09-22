<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// API routes yang tidak memerlukan CSRF
Route::post('/login', [DashboardController::class, 'login']);
Route::get('/dashboard', [DashboardController::class, 'apiData']);
Route::get('/items', [DashboardController::class, 'getItems']);
Route::get('/dataset2', [DashboardController::class, 'getDataset2']);
Route::get('/gudang', [DashboardController::class, 'getGudang']);
Route::get('/site', [DashboardController::class, 'getSite']);
Route::get('/site/{id}', [DashboardController::class, 'getSiteById']);
Route::get('/login-logs', [DashboardController::class, 'getLoginLogs']);
Route::get('/login-stats', [DashboardController::class, 'getLoginStats']);
Route::get('/transaction-status-chart', [DashboardController::class, 'getTransactionStatusChart']);
Route::get('/daily-login-chart', [DashboardController::class, 'getDailyLoginChart']);
Route::get('/gudang-list', [DashboardController::class, 'getGudangList']);
Route::get('/stock-chart', [DashboardController::class, 'getStockChart']);
Route::post('/create-user', [DashboardController::class, 'createUser']);
Route::get('/transaksi', [DashboardController::class, 'getTransaksi']);
Route::get('/transaksi-gudang-list', [DashboardController::class, 'getTransaksiGudangList']);
Route::get('/status-statistics', [DashboardController::class, 'getStatusStatistics']);
Route::get('/status-detail', [DashboardController::class, 'getStatusDetail']);
Route::get('/top-active-warehouses', [DashboardController::class, 'getTopActiveWarehouses']);
Route::get('/warehouse-statistics', [DashboardController::class, 'getWarehouseStatistics']);
