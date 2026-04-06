<?php
function test_endpoint($url, $method = 'GET', $data = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return ['code' => $info['http_code'], 'body' => json_decode($response, true)];
}

echo "Testing Daily Palangal for Kumbam (Index 10):\n";
$res1 = test_endpoint('http://localhost:8000/api/daily-palangal/10');
print_r($res1);

echo "\nTesting Match Horoscopes (2003 Groom vs 2007 Bride):\n";
$matchData = [
    'groom' => ['nakshatra_index' => 24],
    'bride' => ['nakshatra_index' => 10]
];
$res2 = test_endpoint('http://localhost:8000/api/match-horoscopes', 'POST', $matchData);
print_r($res2);
