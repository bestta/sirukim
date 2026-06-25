<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$host = '127.0.0.1';
$dbname = 'db_sirukim';
$user = 'root';
$pass = '';

function jsonResponse(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function requestJson(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        jsonResponse(400, [
            'ok' => false,
            'message' => 'Payload JSON tidak valid.'
        ]);
    }

    return $decoded;
}

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (Throwable $e) {
    jsonResponse(500, [
        'ok' => false,
        'message' => 'Gagal koneksi ke database.',
        'error' => $e->getMessage(),
    ]);
}
