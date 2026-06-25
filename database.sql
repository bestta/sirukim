-- Database Setup for SIRUKIM (Sistem Informasi Rusun)
-- Target: MySQL (XAMPP)
-- Database Name: db_sirukim

CREATE DATABASE IF NOT EXISTS db_sirukim;
USE db_sirukim;

-- 1. Users Table (with password field)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    unit_id VARCHAR(50) NULL,
    active BOOLEAN DEFAULT TRUE
);

-- 1b. Anggota Keluarga Penghuni Table
CREATE TABLE IF NOT EXISTS anggota_keluarga (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Rusun Table
CREATE TABLE IF NOT EXISTS rusun (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL
);

-- 3. Towers Table
CREATE TABLE IF NOT EXISTS towers (
    id VARCHAR(50) PRIMARY KEY,
    rusun_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    floor_count INT NOT NULL DEFAULT 1,
    FOREIGN KEY (rusun_id) REFERENCES rusun(id) ON DELETE CASCADE
);

-- 4. Units Table
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(50) PRIMARY KEY,
    tower_id VARCHAR(50) NOT NULL,
    number VARCHAR(20) NOT NULL,
    floor VARCHAR(10) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    tenant_name VARCHAR(255) NULL,
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE
);

-- 5. Bookings / Pendaftaran Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    applicant_name VARCHAR(255) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    rusun_id VARCHAR(50) NOT NULL,
    rusun_name VARCHAR(255) NOT NULL,
    tower_id VARCHAR(50) NOT NULL,
    unit_id VARCHAR(50) NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_approval',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rusun_id) REFERENCES rusun(id) ON DELETE CASCADE,
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- 6. Tagihan / Bills Table
CREATE TABLE IF NOT EXISTS tagihan (
    id VARCHAR(50) PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    month VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid',
    due_date DATE NOT NULL,
    payment_date DATE NULL,
    proof VARCHAR(255) NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- 7. Complaints / Pengaduan Table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Contracts / Kontrak Vendor Table
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    work_type VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

-- 9. Inspections / Pemeriksaan Table
CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(50) PRIMARY KEY,
    area VARCHAR(255) NOT NULL,
    inspector VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    findings TEXT NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled'
);

-- 10. BTPP (Buku Tanda Pemilikan Perumahan) Table
CREATE TABLE IF NOT EXISTS btpp (
    id VARCHAR(50) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    unit_id VARCHAR(50) NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    submission_date DATE NOT NULL,
    handover_date DATE NULL,
    notes TEXT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- 11. Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- 12. Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
    id VARCHAR(50) PRIMARY KEY,
    survey_id VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'scale',
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- 13. Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
    id VARCHAR(50) PRIMARY KEY,
    survey_id VARCHAR(50) NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- 14. Survey Answers Table
CREATE TABLE IF NOT EXISTS survey_answers (
    id VARCHAR(50) PRIMARY KEY,
    response_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    answer TEXT NOT NULL,
    FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
);

-- 15. Geographic / Location Metadata Tables
CREATE TABLE IF NOT EXISTS provinsi (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS kota (
    id VARCHAR(50) PRIMARY KEY,
    prov_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (prov_id) REFERENCES provinsi(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kecamatan (
    id VARCHAR(50) PRIMARY KEY,
    kota_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (kota_id) REFERENCES kota(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kelurahan (
    id VARCHAR(50) PRIMARY KEY,
    kec_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (kec_id) REFERENCES kecamatan(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fasilitas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL
);

-- ==========================================
-- INSERT DATA INITIALS (MOCK DATA SINKRON)
-- ==========================================

-- Populate Provinsi
INSERT IGNORE INTO provinsi (id, name) VALUES 
('prov-31', 'DKI Jakarta'),
('prov-32', 'Jawa Barat');

-- Populate Kota
INSERT IGNORE INTO kota (id, prov_id, name) VALUES 
('kota-3171', 'prov-31', 'Jakarta Pusat'),
('kota-3172', 'prov-31', 'Jakarta Utara'),
('kota-3175', 'prov-31', 'Jakarta Timur');

-- Populate Kecamatan
INSERT IGNORE INTO kecamatan (id, kota_id, name) VALUES 
('kec-01', 'kota-3172', 'Cilincing'),
('kec-02', 'kota-3175', 'Duren Sawit');

-- Populate Kelurahan
INSERT IGNORE INTO kelurahan (id, kec_id, name) VALUES 
('kel-01', 'kec-01', 'Marunda'),
('kel-02', 'kec-02', 'Pondok Kelapa');

-- Populate Fasilitas
INSERT IGNORE INTO fasilitas (id, name, category) VALUES 
('fas-1', 'Masjid / Mushola', 'Ibadah'),
('fas-2', 'Taman Bermain Anak', 'Sosial'),
('fas-3', 'Klinik Kesehatan', 'Kesehatan'),
('fas-4', 'Pusat Olahraga Outdoor', 'Kebugaran');

-- Populate Users (With passwords based on roles)
INSERT IGNORE INTO users (id, username, password, name, role, email, phone, unit_id, active) VALUES 
('usr-001', 'admin', 'admin123', 'Administrator Utama', 'administrator', 'admin@sirukim.go.id', NULL, NULL, TRUE),
('usr-002', 'dinas_entry', 'dinas123', 'Rian Hidayat (Entry)', 'entry_data', 'rian.entry@sirukim.go.id', NULL, NULL, TRUE),
('usr-003', 'uprs_perawatan', 'uprs123', 'UPRS Wilayah I', 'uprs_perawatan', 'uprs.w1@sirukim.go.id', NULL, NULL, TRUE),
('usr-004', 'penghuni_budi', 'budi123', 'Budi Santoso', 'penghuni', 'budi.santoso@gmail.com', '081234567890', 'unit-101', TRUE),
('usr-005', 'pimpinan_dinas', 'pimpinan123', 'Dr. Ir. H. Heru Wahyudi (Kadis)', 'pimpinan_dinas', 'heru.wahyudi@sirukim.go.id', NULL, NULL, TRUE);

-- Populate Anggota Keluarga
INSERT IGNORE INTO anggota_keluarga (id, user_id, nik, nama_lengkap, tanggal_lahir, jenis_kelamin) VALUES
('kel-usr-004-1', 'usr-004', '3174090101900001', 'Budi Santoso', '1990-01-01', 'Laki-laki');

-- Populate Rusun
INSERT IGNORE INTO rusun (id, name, type, address) VALUES 
('rusun-1', 'Rusunawa Marunda', 'Rusunawa (Sewa)', 'Jl. Marunda Baru, Cilincing, Jakarta Utara'),
('rusun-2', 'Rusunami Klapa Village', 'Rusunami (Milik)', 'Jl. H. Naman, Pondok Kelapa, Jakarta Timur');

-- Populate Towers
INSERT IGNORE INTO towers (id, rusun_id, name, floor_count) VALUES 
('tow-1-a', 'rusun-1', 'Block A', 2),
('tow-1-b', 'rusun-1', 'Block B', 1),
('tow-2-a', 'rusun-2', 'Tower Samawa', 1);

-- Populate Units
INSERT IGNORE INTO units (id, tower_id, number, floor, price, status, tenant_name) VALUES 
('unit-101', 'tow-1-a', 'A-101', '1', 450000.00, 'occupied', 'Budi Santoso'),
('unit-102', 'tow-1-a', 'A-102', '1', 450000.00, 'available', ''),
('unit-103', 'tow-1-a', 'A-103', '1', 450000.00, 'maintenance', ''),
('unit-201', 'tow-1-a', 'A-201', '2', 475000.00, 'occupied', 'Ahmad Fauzi'),
('unit-202', 'tow-1-a', 'A-202', '2', 475000.00, 'available', ''),
('unit-b101', 'tow-1-b', 'B-101', '1', 450000.00, 'occupied', 'Siti Rahma'),
('unit-b102', 'tow-1-b', 'B-102', '1', 450000.00, 'available', ''),
('unit-milik-101', 'tow-2-a', 'S-101', '1', 185000000.00, 'occupied', 'Joko Widodo'),
('unit-milik-102', 'tow-2-a', 'S-102', '1', 185000000.00, 'booked', 'Diana Lestari'),
('unit-milik-103', 'tow-2-a', 'S-103', '1', 185000000.00, 'available', '');

-- Populate Bookings
INSERT IGNORE INTO bookings (id, applicant_name, nik, email, phone, rusun_id, rusun_name, tower_id, unit_id, unit_number, type, status, created_at) VALUES 
('bkg-101', 'Diana Lestari', '3174092108920005', 'diana.lestari@gmail.com', '085712345678', 'rusun-2', 'Rusunami Klapa Village', 'tow-2-a', 'unit-milik-102', 'S-102', 'Rusunami Umum', 'pending_approval', '2026-06-20 10:00:00'),
('bkg-102', 'Rudi Hartono', '3172081504850002', 'rudi.hartono@yahoo.com', '081398765432', 'rusun-1', 'Rusunawa Marunda', 'tow-1-a', 'unit-102', 'A-102', 'Rusunawa Relokasi', 'approved', '2026-06-18 08:30:00');

-- Populate Tagihan
INSERT IGNORE INTO tagihan (id, unit_id, unit_number, tenant_name, type, amount, month, status, due_date, payment_date, proof) VALUES 
('tag-001', 'unit-101', 'A-101', 'Budi Santoso', 'Rent', 450000.00, 'Juni 2026', 'unpaid', '2026-06-10', NULL, NULL),
('tag-002', 'unit-101', 'A-101', 'Budi Santoso', 'Utility (Air & Listrik)', 125000.00, 'Juni 2026', 'paid', '2026-06-10', '2026-06-08', 'receipt_juni.jpg'),
('tag-003', 'unit-201', 'A-201', 'Ahmad Fauzi', 'Rent', 475000.00, 'Juni 2026', 'paid', '2026-06-10', '2026-06-05', 'receipt_ahmad.jpg'),
('tag-004', 'unit-101', 'A-101', 'Budi Santoso', 'Rent', 450000.00, 'Mei 2026', 'paid', '2026-05-10', '2026-05-09', 'receipt_mei.jpg'),
('tag-005', 'unit-b101', 'B-101', 'Siti Rahma', 'Rent', 450000.00, 'Juni 2026', 'overdue', '2026-06-05', NULL, NULL);

-- Populate Complaints
INSERT IGNORE INTO complaints (id, sender_id, sender_name, unit_number, category, description, status, created_at, notes) VALUES 
('cmp-001', 'usr-004', 'Budi Santoso', 'A-101', 'Fasilitas Air', 'Air PDAM di kamar mandi mati sejak kemarin sore. Mohon diperiksa pipa salurannya.', 'processing', '2026-06-22 14:20:00', 'Petugas sedang mengecek pipa utama di Block A.'),
('cmp-002', 'usr-004', 'Budi Santoso', 'A-101', 'Kelistrikan', 'Sekring listrik sering anjlok jika menyalakan pompa air dan dispenser bersamaan.', 'submitted', '2026-06-23 11:00:00', ''),
('cmp-003', 'usr-004', 'Budi Santoso', 'A-201', 'Struktur Bangunan', 'Kebocoran atap dak beton saat hujan deras, air merembes ke langit-langit ruang tamu.', 'resolved', '2026-06-10 09:00:00', 'Sudah dilakukan pelapisan waterproofing sika pada dak beton lantai atas.');

-- Populate Contracts
INSERT IGNORE INTO contracts (id, vendor_name, work_type, start_date, end_date, budget, status) VALUES 
('ctr-001', 'PT. Bangun Graha Mandiri', 'Perawatan Lift & Elektrikal', '2026-01-01', '2026-12-31', 120000000.00, 'active'),
('ctr-002', 'CV. Tirta Kencana', 'Pembersihan & Distribusi Air Bersih', '2026-03-01', '2026-09-30', 45000000.00, 'active');

-- Populate Inspections
INSERT IGNORE INTO inspections (id, area, inspector, date, findings, urgency, status) VALUES 
('ins-001', 'Area Parkir Block A', 'Sulaeman (UPRS)', '2026-06-15', 'Paving block amblas sepanjang 3 meter dekat pintu masuk.', 'Medium', 'scheduled'),
('ins-002', 'Pompa Utama Marunda', 'Dedi (Teknisi)', '2026-06-21', 'Ditemukan keausan pada seal impeller pompa 2. Butuh penggantian.', 'High', 'completed');

-- Populate BTPP
INSERT IGNORE INTO btpp (id, tenant_name, unit_id, unit_number, status, submission_date, handover_date, notes) VALUES 
('btp-001', 'Joko Widodo', 'unit-milik-101', 'S-101', 'approved', '2026-05-15', '2026-06-12', 'Sertifikat dan kunci telah diserahterimakan.'),
('btp-002', 'Diana Lestari', 'unit-milik-102', 'S-102', 'pending', '2026-06-21', NULL, 'Menunggu pelunasan berkas administrasi.');

-- Populate Surveys
INSERT IGNORE INTO surveys (id, title, description, active) VALUES 
('srv-001', 'Survei Kepuasan Layanan Rusun Q2 2026', 'Kuesioner evaluasi kebersihan, keamanan, dan respon perawatan.', TRUE);

-- Populate Survey Questions
INSERT IGNORE INTO survey_questions (id, survey_id, text, type) VALUES 
('q-1', 'srv-001', 'Bagaimana tanggapan Anda mengenai kebersihan area publik rusun?', 'scale'),
('q-2', 'srv-001', 'Apakah petugas keamanan merespon dengan cepat jika ada aduan?', 'scale'),
('q-3', 'srv-001', 'Tuliskan saran perbaikan untuk pengelola rusun:', 'text');

-- Populate Survey Responses
INSERT IGNORE INTO survey_responses (id, survey_id, tenant_name, date) VALUES 
('res-001', 'srv-001', 'Ahmad Fauzi', '2026-06-18'),
('res-002', 'srv-001', 'Siti Rahma', '2026-06-20');

-- Populate Survey Answers
INSERT IGNORE INTO survey_answers (id, response_id, question_id, answer) VALUES 
('ans-001', 'res-001', 'q-1', '4'),
('ans-002', 'res-001', 'q-2', '5'),
('ans-003', 'res-001', 'q-3', 'Kebersihan koridor sudah baik, tolong pertahankan.'),
('ans-004', 'res-002', 'q-1', '3'),
('ans-005', 'res-002', 'q-2', '4'),
('ans-006', 'res-002', 'q-3', 'Tolong tertibkan parkir sepeda motor liar.');
