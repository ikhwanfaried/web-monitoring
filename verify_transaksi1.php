<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Transaksi1;

echo "Total records in transaksi1 table: " . Transaksi1::count() . "\n";
echo "\nSample records:\n";

$samples = Transaksi1::take(5)->get();

foreach ($samples as $record) {
    echo "ID: {$record->id}, INVUSENUM: {$record->invusenum}, Nomer Dokumen: {$record->nomer_dokumen}, Site: {$record->site}\n";
}

echo "\nUnique sites:\n";
$sites = Transaksi1::distinct()->pluck('site')->take(10);
foreach ($sites as $site) {
    echo "- {$site}\n";
}

echo "\nUnique status transaksi:\n";
$statuses = Transaksi1::distinct()->pluck('status_transaksi');
foreach ($statuses as $status) {
    echo "- {$status}\n";
}
