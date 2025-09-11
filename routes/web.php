<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/', [DashboardController::class, 'index']);
Route::get('/api/dashboard', [DashboardController::class, 'apiData']);
Route::get('/api/items', [DashboardController::class, 'getItems']);
Route::get('/api/dataset2', [DashboardController::class, 'getDataset2']);
Route::get('/api/gudang', [DashboardController::class, 'getGudang']);
Route::get('/api/site', [DashboardController::class, 'getSite']);
Route::get('/api/gudang-list', [DashboardController::class, 'getGudangList']);
Route::get('/api/login-logs', [DashboardController::class, 'getLoginLogs']);
Route::get('/api/login-stats', [DashboardController::class, 'getLoginStats']);
Route::get('/api/transaction-status-chart', [DashboardController::class, 'getTransactionStatusChart']);
Route::get('/api/daily-login-chart', [DashboardController::class, 'getDailyLoginChart']);
Route::get('/api/stock-chart', [DashboardController::class, 'getStockChart']);
// Route untuk halaman tambah user
Route::view('/add-user', 'add-user');
