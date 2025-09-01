<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing login API...\n";

// Test database connection
try {
    $user = DB::table('user')->where('username', 'admin1')->first();
    if ($user) {
        echo "User found: " . $user->username . " - " . $user->Nama . "\n";
        echo "Password from DB: " . $user->password . "\n";
        
        // Test password comparison
        $inputPassword = '123456';
        if ($user->password === $inputPassword) {
            echo "Password match: YES\n";
        } else {
            echo "Password match: NO\n";
            echo "Expected: $inputPassword\n";
            echo "Got: " . $user->password . "\n";
        }
    } else {
        echo "User not found!\n";
    }
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
