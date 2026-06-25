<?php
require_once __DIR__ . '/../_bootstrap.php';

$body = requestJson();
$identifier = trim((string)($body['identifier'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($identifier === '' || $password === '') {
    jsonResponse(400, [
        'ok' => false,
        'message' => 'Username/email dan password wajib diisi.'
    ]);
}

$stmt = $pdo->prepare(
    'SELECT id, username, name, role, email, phone, unit_id, active, password
     FROM users
     WHERE (LOWER(username) = LOWER(:identifier) OR LOWER(email) = LOWER(:identifier))
     LIMIT 1'
);
$stmt->execute(['identifier' => $identifier]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(401, [
        'ok' => false,
        'message' => 'Akun tidak ditemukan.'
    ]);
}

if ((string)$user['password'] !== $password) {
    jsonResponse(401, [
        'ok' => false,
        'message' => 'Password yang Anda masukkan tidak sesuai.'
    ]);
}

if ((int)$user['active'] !== 1) {
    jsonResponse(403, [
        'ok' => false,
        'message' => 'Akun tidak aktif. Silakan hubungi administrator.'
    ]);
}

unset($user['password']);
$user['active'] = (bool)$user['active'];
$user['unitId'] = $user['unit_id'];
unset($user['unit_id']);

jsonResponse(200, [
    'ok' => true,
    'user' => $user
]);
