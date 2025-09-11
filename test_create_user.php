<?php
// Test API create user
$url = 'http://localhost:8001/api/users';

$data = [
    'username' => 'testuser123',
    'password' => 'password123',
    'Nama' => 'Test User',
    'NRP' => 'NRP123456',
    'Email' => 'test@example.com',
    'id_satuan' => 'SAT001'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error: Could not connect to API\n";
} else {
    echo "Response: " . $result . "\n";
}

// Print HTTP response headers
if (isset($http_response_header)) {
    echo "\nHTTP Headers:\n";
    foreach($http_response_header as $header) {
        echo $header . "\n";
    }
}
?>
