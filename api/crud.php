<?php
require_once __DIR__ . '/_bootstrap.php';

$schemas = [
    'users' => ['id', 'username', 'password', 'name', 'role', 'email', 'phone', 'unit_id', 'active'],
    'anggota_keluarga' => ['id', 'user_id', 'nik', 'nama_lengkap', 'tanggal_lahir', 'jenis_kelamin'],
    'rusun' => ['id', 'name', 'type', 'address'],
    'towers' => ['id', 'rusun_id', 'name', 'floor_count'],
    'units' => ['id', 'tower_id', 'number', 'floor', 'price', 'status', 'tenant_name'],
    'bookings' => ['id', 'applicant_name', 'nik', 'email', 'phone', 'rusun_id', 'rusun_name', 'tower_id', 'unit_id', 'unit_number', 'type', 'status', 'created_at'],
    'tagihan' => ['id', 'unit_id', 'unit_number', 'tenant_name', 'type', 'amount', 'month', 'status', 'due_date', 'payment_date', 'proof'],
    'complaints' => ['id', 'sender_id', 'sender_name', 'unit_number', 'category', 'description', 'status', 'created_at', 'notes'],
    'contracts' => ['id', 'vendor_name', 'work_type', 'start_date', 'end_date', 'budget', 'status'],
    'inspections' => ['id', 'area', 'inspector', 'date', 'findings', 'urgency', 'status'],
    'btpp' => ['id', 'tenant_name', 'unit_id', 'unit_number', 'status', 'submission_date', 'handover_date', 'notes'],
    'surveys' => ['id', 'title', 'description', 'active'],
    'survey_questions' => ['id', 'survey_id', 'text', 'type'],
    'survey_responses' => ['id', 'survey_id', 'tenant_name', 'date'],
    'survey_answers' => ['id', 'response_id', 'question_id', 'answer'],
    'provinsi' => ['id', 'name'],
    'kota' => ['id', 'prov_id', 'name'],
    'kecamatan' => ['id', 'kota_id', 'name'],
    'kelurahan' => ['id', 'kec_id', 'name'],
    'fasilitas' => ['id', 'name', 'category'],
];

$body = requestJson();
$action = strtolower((string)($body['action'] ?? ''));
$table = (string)($body['table'] ?? '');
$id = (string)($body['id'] ?? '');
$data = is_array($body['data'] ?? null) ? $body['data'] : [];

if (!isset($schemas[$table])) {
    jsonResponse(400, [
        'ok' => false,
        'message' => 'Tabel tidak diizinkan.'
    ]);
}

$allowedColumns = $schemas[$table];
$filtered = [];
foreach ($data as $key => $value) {
    if (in_array($key, $allowedColumns, true)) {
        $filtered[$key] = $value;
    }
}

try {
    if ($action === 'create') {
        if (count($filtered) === 0) {
            jsonResponse(400, ['ok' => false, 'message' => 'Data create kosong.']);
        }

        $columns = array_keys($filtered);
        $params = array_map(fn($c) => ':' . $c, $columns);
        $sql = 'INSERT INTO ' . $table . ' (' . implode(',', $columns) . ') VALUES (' . implode(',', $params) . ')';

        $stmt = $pdo->prepare($sql);
        foreach ($filtered as $column => $value) {
            $stmt->bindValue(':' . $column, $value);
        }
        $stmt->execute();

        jsonResponse(200, ['ok' => true, 'message' => 'Data berhasil ditambahkan.']);
    }

    if ($action === 'update') {
        if ($id === '') {
            jsonResponse(400, ['ok' => false, 'message' => 'ID wajib untuk update.']);
        }
        unset($filtered['id']);

        if (count($filtered) === 0) {
            jsonResponse(400, ['ok' => false, 'message' => 'Data update kosong.']);
        }

        $setParts = [];
        foreach (array_keys($filtered) as $column) {
            $setParts[] = $column . ' = :' . $column;
        }

        $sql = 'UPDATE ' . $table . ' SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        foreach ($filtered as $column => $value) {
            $stmt->bindValue(':' . $column, $value);
        }
        $stmt->bindValue(':id', $id);
        $stmt->execute();

        jsonResponse(200, ['ok' => true, 'message' => 'Data berhasil diperbarui.']);
    }

    if ($action === 'delete') {
        if ($id === '') {
            jsonResponse(400, ['ok' => false, 'message' => 'ID wajib untuk delete.']);
        }

        $stmt = $pdo->prepare('DELETE FROM ' . $table . ' WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse(200, ['ok' => true, 'message' => 'Data berhasil dihapus.']);
    }

    jsonResponse(400, [
        'ok' => false,
        'message' => 'Action tidak dikenali. Gunakan create, update, atau delete.'
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        'ok' => false,
        'message' => 'Operasi database gagal.',
        'error' => $e->getMessage(),
    ]);
}
