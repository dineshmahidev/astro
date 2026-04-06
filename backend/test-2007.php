<?php
$data = [
    "name" => "Erode 2007 Test",
    "date_of_birth" => "1979-04-15",
    "time_of_birth" => "18:00:00",
    "latitude" => 11.3410,
    "longitude" => 77.7172,
    "place_name" => "Erode"
];

$ch = curl_init('http://localhost:8000/api/calculate-chart');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
file_put_contents('astro_response.json', $response);
if ($response === false) {
    echo "Error: " . curl_error($ch) . "\n";
} else {
    $res = json_decode($response, true);
    var_dump($res); // Debug
    echo "Lagna: "    . $res['lagna']['name_english']    . " (" . $res['lagna']['name_tamil'] . ")\n";
    echo "Moon Rasi: ". $res['moon_rasi']['name_english'] . " (" . $res['moon_rasi']['name_tamil'] . ")\n";
    echo "Nakshatra: ". $res['nakshatra']['name']        . " (Pada " . $res['nakshatra']['pada'] . ")\n";
}
curl_close($ch);
