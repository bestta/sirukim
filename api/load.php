<?php
require_once __DIR__ . '/_bootstrap.php';

function toBool($value): bool {
    return (int)$value === 1;
}

function mapDateTime(?string $value): ?string {
    if (!$value) {
        return null;
    }

    return str_replace(' ', 'T', $value) . 'Z';
}

try {
    $users = $pdo->query('SELECT id, username, name, role, email, phone, unit_id, active, password FROM users')->fetchAll();
    $users = array_map(function ($u) {
        return [
            'id' => $u['id'],
            'username' => $u['username'],
            'name' => $u['name'],
            'role' => $u['role'],
            'email' => $u['email'],
            'phone' => $u['phone'],
            'unitId' => $u['unit_id'],
            'active' => toBool($u['active']),
            'password' => $u['password'],
        ];
    }, $users);

    $rusunRows = $pdo->query('SELECT id, name, type, address FROM rusun')->fetchAll();
    $towerRows = $pdo->query('SELECT id, rusun_id, name, floor_count FROM towers')->fetchAll();
    $unitRows = $pdo->query('SELECT id, tower_id, number, floor, price, status, tenant_name FROM units')->fetchAll();

    $unitsByTower = [];
    foreach ($unitRows as $unit) {
        $unitsByTower[$unit['tower_id']][] = [
            'id' => $unit['id'],
            'number' => $unit['number'],
            'floor' => $unit['floor'],
            'price' => (float)$unit['price'],
            'status' => $unit['status'],
            'tenantName' => $unit['tenant_name'],
        ];
    }

    $towersByRusun = [];
    foreach ($towerRows as $tower) {
        $towersByRusun[$tower['rusun_id']][] = [
            'id' => $tower['id'],
            'name' => $tower['name'],
            'floorCount' => (int)($tower['floor_count'] ?? 1),
            'units' => $unitsByTower[$tower['id']] ?? [],
        ];
    }

    $rusun = [];
    foreach ($rusunRows as $r) {
        $rusun[] = [
            'id' => $r['id'],
            'name' => $r['name'],
            'type' => $r['type'],
            'address' => $r['address'],
            'towers' => $towersByRusun[$r['id']] ?? [],
        ];
    }

    $bookings = $pdo->query('SELECT * FROM bookings')->fetchAll();
    $bookings = array_map(function ($b) {
        return [
            'id' => $b['id'],
            'applicantName' => $b['applicant_name'],
            'nik' => $b['nik'],
            'email' => $b['email'],
            'phone' => $b['phone'],
            'rusunId' => $b['rusun_id'],
            'rusunName' => $b['rusun_name'],
            'towerId' => $b['tower_id'],
            'unitId' => $b['unit_id'],
            'unitNumber' => $b['unit_number'],
            'type' => $b['type'],
            'status' => $b['status'],
            'createdAt' => mapDateTime($b['created_at']),
            'documents' => [],
        ];
    }, $bookings);

    $tagihan = $pdo->query('SELECT * FROM tagihan')->fetchAll();
    $tagihan = array_map(function ($t) {
        return [
            'id' => $t['id'],
            'unitId' => $t['unit_id'],
            'unitNumber' => $t['unit_number'],
            'tenantName' => $t['tenant_name'],
            'type' => $t['type'],
            'amount' => (float)$t['amount'],
            'month' => $t['month'],
            'status' => $t['status'],
            'dueDate' => $t['due_date'],
            'paymentDate' => $t['payment_date'],
            'proof' => $t['proof'],
        ];
    }, $tagihan);

    $complaints = $pdo->query('SELECT * FROM complaints')->fetchAll();
    $complaints = array_map(function ($c) {
        return [
            'id' => $c['id'],
            'senderId' => $c['sender_id'],
            'senderName' => $c['sender_name'],
            'unitNumber' => $c['unit_number'],
            'category' => $c['category'],
            'description' => $c['description'],
            'status' => $c['status'],
            'createdAt' => mapDateTime($c['created_at']),
            'notes' => $c['notes'] ?? '',
        ];
    }, $complaints);

    $contracts = $pdo->query('SELECT * FROM contracts')->fetchAll();
    $contracts = array_map(function ($c) {
        return [
            'id' => $c['id'],
            'vendorName' => $c['vendor_name'],
            'workType' => $c['work_type'],
            'startDate' => $c['start_date'],
            'endDate' => $c['end_date'],
            'budget' => (float)$c['budget'],
            'status' => $c['status'],
        ];
    }, $contracts);

    $inspections = $pdo->query('SELECT * FROM inspections')->fetchAll();
    $inspections = array_map(function ($i) {
        return [
            'id' => $i['id'],
            'area' => $i['area'],
            'inspector' => $i['inspector'],
            'date' => $i['date'],
            'findings' => $i['findings'],
            'urgency' => $i['urgency'],
            'status' => $i['status'],
        ];
    }, $inspections);

    $btpp = $pdo->query('SELECT * FROM btpp')->fetchAll();
    $btpp = array_map(function ($b) {
        return [
            'id' => $b['id'],
            'tenantName' => $b['tenant_name'],
            'unitId' => $b['unit_id'],
            'unitNumber' => $b['unit_number'],
            'status' => $b['status'],
            'submissionDate' => $b['submission_date'],
            'handoverDate' => $b['handover_date'],
            'notes' => $b['notes'],
        ];
    }, $btpp);

    $surveyRows = $pdo->query('SELECT id, title, description, active FROM surveys')->fetchAll();
    $questionRows = $pdo->query('SELECT id, survey_id, text, type FROM survey_questions')->fetchAll();

    $questionsBySurvey = [];
    foreach ($questionRows as $q) {
        $questionsBySurvey[$q['survey_id']][] = [
            'id' => $q['id'],
            'text' => $q['text'],
            'type' => $q['type'],
        ];
    }

    $surveys = [];
    foreach ($surveyRows as $s) {
        $surveys[] = [
            'id' => $s['id'],
            'title' => $s['title'],
            'description' => $s['description'],
            'active' => toBool($s['active']),
            'questions' => $questionsBySurvey[$s['id']] ?? [],
        ];
    }

    $responseRows = $pdo->query('SELECT id, survey_id, tenant_name, date FROM survey_responses')->fetchAll();
    $answerRows = $pdo->query('SELECT response_id, question_id, answer FROM survey_answers')->fetchAll();

    $answersByResponse = [];
    foreach ($answerRows as $a) {
        if (!isset($answersByResponse[$a['response_id']])) {
            $answersByResponse[$a['response_id']] = [];
        }
        $answersByResponse[$a['response_id']][$a['question_id']] = $a['answer'];
    }

    $surveyResponses = [];
    foreach ($responseRows as $r) {
        $surveyResponses[] = [
            'id' => $r['id'],
            'surveyId' => $r['survey_id'],
            'tenantName' => $r['tenant_name'],
            'answers' => $answersByResponse[$r['id']] ?? [],
            'date' => $r['date'],
        ];
    }

    $metadata = [
        'provinsi' => $pdo->query('SELECT id, name FROM provinsi')->fetchAll(),
        'kota' => $pdo->query('SELECT id, prov_id AS provId, name FROM kota')->fetchAll(),
        'kecamatan' => $pdo->query('SELECT id, kota_id AS kotaId, name FROM kecamatan')->fetchAll(),
        'kelurahan' => $pdo->query('SELECT id, kec_id AS kecId, name FROM kelurahan')->fetchAll(),
        'fasilitas' => $pdo->query('SELECT id, name, category FROM fasilitas')->fetchAll(),
    ];

    $anggotaKeluarga = [];
    try {
        $anggotaKeluargaRows = $pdo->query('SELECT id, user_id, nik, nama_lengkap, tanggal_lahir, jenis_kelamin FROM anggota_keluarga')->fetchAll();
        $anggotaKeluarga = array_map(function ($a) {
            return [
                'id' => $a['id'],
                'userId' => $a['user_id'],
                'nik' => $a['nik'],
                'namaLengkap' => $a['nama_lengkap'],
                'tanggalLahir' => $a['tanggal_lahir'],
                'jenisKelamin' => $a['jenis_kelamin'],
            ];
        }, $anggotaKeluargaRows);
    } catch (Throwable $ignored) {
        $anggotaKeluarga = [];
    }

    jsonResponse(200, [
        'ok' => true,
        'data' => [
            'users' => $users,
            'rusun' => $rusun,
            'bookings' => $bookings,
            'tagihan' => $tagihan,
            'complaints' => $complaints,
            'contracts' => $contracts,
            'inspections' => $inspections,
            'btpp' => $btpp,
            'surveys' => $surveys,
            'surveyResponses' => $surveyResponses,
            'metadata' => $metadata,
            'anggotaKeluarga' => $anggotaKeluarga,
        ],
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        'ok' => false,
        'message' => 'Gagal memuat data dari database.',
        'error' => $e->getMessage(),
    ]);
}
