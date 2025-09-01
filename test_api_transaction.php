<?php

// Test file untuk memverifikasi transaction status API
$url = 'http://127.0.0.1:8000/api/transaction-status';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch)) {
    echo "cURL Error: " . curl_error($ch) . "\n";
} else {
    echo "HTTP Status: " . $httpCode . "\n";
    echo "Response: " . $response . "\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data) {
            echo "\nTransaction Status Data:\n";
            foreach ($data as $item) {
                echo "- {$item['name']}: {$item['value']}\n";
            }
        }
    }
}

curl_close($ch);
