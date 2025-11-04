<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/login', [DashboardController::class, 'login'])->middleware('web');
Route::get('/dashboard', [DashboardController::class, 'apiData']);
Route::get('/items', [DashboardController::class, 'getItems']);
Route::get('/dataset2', [DashboardController::class, 'getDataset2']);
Route::get('/gudang', [DashboardController::class, 'getGudang']);
Route::get('/site', [DashboardController::class, 'getSite']);
Route::get('/site/{id}', [DashboardController::class, 'getSiteById']);
Route::get('/status', [DashboardController::class, 'getStatus']);
Route::get('/login-logs', [DashboardController::class, 'getLoginLogs']);
Route::get('/login-stats', [DashboardController::class, 'getLoginStats']);
Route::get('/transaction-status-chart', [DashboardController::class, 'getTransactionStatusChart']);
Route::get('/daily-login-chart', [DashboardController::class, 'getDailyLoginChart']);
Route::get('/gudang-list', [DashboardController::class, 'getGudangList']);
Route::get('/nama-barang-list', [DashboardController::class, 'getNamaBarangList']);
Route::get('/transaksi-nama-barang-list', [DashboardController::class, 'getTransaksiNamaBarangList']);
Route::get('/stock-chart', [DashboardController::class, 'getStockChart']);
Route::post('/create-user', [DashboardController::class, 'createUser']);
Route::get('/transaksi', [DashboardController::class, 'getTransaksi']);
Route::get('/transaksi-gudang-list', [DashboardController::class, 'getTransaksiGudangList']);
Route::get('/nama-barang-list', [DashboardController::class, 'getNamaBarangList']);
Route::get('/transaksi-nama-barang-list', [DashboardController::class, 'getTransaksiNamaBarangList']);
Route::get('/status-statistics', [DashboardController::class, 'getStatusStatistics']);
Route::get('/status-detail', [DashboardController::class, 'getStatusDetail']);
Route::get('/top-active-warehouses', [DashboardController::class, 'getTopActiveWarehouses']);
Route::get('/warehouse-statistics', [DashboardController::class, 'getWarehouseStatistics']);
Route::get('/users', [DashboardController::class, 'getUsers']);
Route::delete('/delete-user/{id}', [DashboardController::class, 'deleteUser']);
Route::get('/gudang-modal', [DashboardController::class, 'getGudangModalData']);
Route::get('/site-modal', [DashboardController::class, 'getSiteModalData']);
Route::get('/site-list', [DashboardController::class, 'getSiteList']);
Route::post('/gudang/add', [DashboardController::class, 'addGudang']);
Route::post('/site/add', [DashboardController::class, 'addSite']);
Route::get('/item-list', [DashboardController::class, 'getItemList']);
Route::post('/item/add', [DashboardController::class, 'addItem']);
Route::post('/item-type/add', [DashboardController::class, 'addItemType']);
Route::get('/location-list', [DashboardController::class, 'getLocationList']);
Route::post('/transaksi/add', [DashboardController::class, 'addTransaksi']);
Route::post('/transaksi/update-status', [DashboardController::class, 'updateTransaksiStatus']);
