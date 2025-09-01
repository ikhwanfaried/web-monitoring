<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/', [DashboardController::class, 'index']);
Route::get('/api/dashboard', [DashboardController::class, 'apiData']);
Route::get('/api/items', [DashboardController::class, 'getItems']);
Route::get('/api/dataset2', [DashboardController::class, 'getDataset2']);
Route::get('/api/gudang', [DashboardController::class, 'getGudang']);
Route::get('/api/site', [DashboardController::class, 'getSite']);
