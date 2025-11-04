<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;

// Public routes - Login/Logout (tidak perlu auth)
Route::get('/login', function () {
    return view('app'); // Tampilkan React app untuk login
})->name('login')->middleware('guest');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected Routes - Memerlukan authentication
Route::middleware(['auth'])->group(function () {
    // Main dashboard route - akan redirect berdasarkan user role
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Role-based dashboard routes
    Route::get('/superadmin', [DashboardController::class, 'superAdminDashboard'])->name('superadmin.dashboard');
    Route::get('/admin', [DashboardController::class, 'adminDashboard'])->name('admin.dashboard');  
    Route::get('/user', [DashboardController::class, 'userDashboard'])->name('user.dashboard');

    Route::get('/add-user', function () {
        return view('add-user');
    });
    
    // API Routes - juga perlu authentication
    Route::prefix('api')->group(function () {
        Route::get('/data', [DashboardController::class, 'apiData']);
        Route::get('/items', [DashboardController::class, 'getItems']);
        Route::get('/dataset2', [DashboardController::class, 'getDataset2']);
        Route::get('/gudang', [DashboardController::class, 'getGudang']);
        Route::get('/site', [DashboardController::class, 'getSite']);
        Route::get('/transaksi1', [DashboardController::class, 'getTransaksi1']);
        Route::get('/dataset40200', [DashboardController::class, 'getDataset40200']);
        Route::get('/dataset40201', [DashboardController::class, 'getDataset40201']);
        Route::get('/dataset40202', [DashboardController::class, 'getDataset40202']);
        Route::post('/seed-verify-data', [DashboardController::class, 'seedVerifyData']);
        Route::get('/login-logs', [DashboardController::class, 'getLoginLogs']);
        Route::get('/detail-data/{id}', [DashboardController::class, 'getDetailData']);
        Route::post('/update-item/{id}', [DashboardController::class, 'updateItem']);
        Route::get('/users', [DashboardController::class, 'getUsers']);
        Route::delete('/users/{id}', [DashboardController::class, 'deleteUser']);
        Route::post('/users/{id}/update-status', [DashboardController::class, 'updateUserStatus']);
    });
});

// Test route (bisa diakses tanpa login untuk debugging)
Route::get('/test-sqlsrv', function(){
    try{
        $db = DB::connection('sqlsrv');
        return 'Connected as : ' . $db->getConfig('username');
    } catch (\Exception $e){
        return 'Connection failed: ' . $e->getMessage();
    }
});

// Fallback route
Route::fallback(function () {
    return view('app');
});

