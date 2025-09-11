<?php
// Test API create user dengan curl
$url = 'http://localhost:8001/api/users';

$data = [
    'username' => 'testuser' . time(),
    'password' => 'password123',
    'Nama' => 'Test User',
    'NRP' => intval(time()),  // NRP sebagai integer
    'Email' => 'test' . time() . '@example.com',
    'id_satuan' => 1  // id_satuan sebagai integer
];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$error = curl_error($curl);
curl_close($curl);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
if ($error) {
    echo "Curl Error: $error\n";
}
?>
