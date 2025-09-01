<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Transaksi1;
use Illuminate\Support\Facades\DB;

echo "Testing Transaction Status API endpoint...\n\n";

// Test query directly
$statusData = Transaksi1::select('status_transaksi', DB::raw('count(*) as count'))
    ->whereNotNull('status_transaksi')
    ->where('status_transaksi', '!=', '')
    ->groupBy('status_transaksi')
    ->orderBy('count', 'desc')
    ->get();

echo "Status Transaksi Distribution:\n";
echo "================================\n";

foreach ($statusData as $item) {
    echo sprintf("%-20s: %d\n", $item->status_transaksi, $item->count);
}

echo "\nTotal records with status: " . $statusData->sum('count') . "\n";

echo "\nChart data format:\n";
echo "==================\n";

$chartData = $statusData->map(function($item) {
    return [
        'name' => $item->status_transaksi,
        'value' => $item->count
    ];
});

echo json_encode($chartData, JSON_PRETTY_PRINT);
