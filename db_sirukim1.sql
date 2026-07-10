-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 25 Jun 2026 pada 10.48
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_sirukim`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `anggota_keluarga`
--

CREATE TABLE `anggota_keluarga` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `nik` varchar(20) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenis_kelamin` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `anggota_keluarga`
--

INSERT INTO `anggota_keluarga` (`id`, `user_id`, `nik`, `nama_lengkap`, `tanggal_lahir`, `jenis_kelamin`) VALUES
('kel-1782276252971', 'usr-1782272122169', '9798465451321', 'Momo', '1987-01-01', 'Laki-laki'),
('kel-1782283320710', 'usr-004', '215468746513215', 'Elsa Santoso', '1990-01-01', 'Perempuan');

-- --------------------------------------------------------

--
-- Struktur dari tabel `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `applicant_name` varchar(255) NOT NULL,
  `nik` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `rusun_id` varchar(50) NOT NULL,
  `rusun_name` varchar(255) NOT NULL,
  `tower_id` varchar(50) NOT NULL,
  `unit_id` varchar(50) NOT NULL,
  `unit_number` varchar(20) NOT NULL,
  `type` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'pending_approval',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bookings`
--

INSERT INTO `bookings` (`id`, `applicant_name`, `nik`, `email`, `phone`, `rusun_id`, `rusun_name`, `tower_id`, `unit_id`, `unit_number`, `type`, `status`, `created_at`) VALUES
('bkg-1782273988146', 'popi asmara', '580704552524524', 'popi@gmail.com', '08547521036', 'rusun-1782272620881', 'Rusunawa Tebet', 'tow-1782272719401', 'unit-1782272752233', 'A-001', 'Rusunawa Umum', 'pending_approval', '2026-06-23 21:06:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `btpp`
--

CREATE TABLE `btpp` (
  `id` varchar(50) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `unit_id` varchar(50) NOT NULL,
  `unit_number` varchar(20) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `submission_date` date NOT NULL,
  `handover_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `complaints`
--

CREATE TABLE `complaints` (
  `id` varchar(50) NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `unit_number` varchar(20) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `contracts`
--

CREATE TABLE `contracts` (
  `id` varchar(50) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `work_type` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `budget` decimal(15,2) NOT NULL,
  `status` varchar(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `contracts`
--

INSERT INTO `contracts` (`id`, `vendor_name`, `work_type`, `start_date`, `end_date`, `budget`, `status`) VALUES
('ctr-001', 'PT. Bangun Graha Mandiri', 'Perawatan Lift & Elektrikal', '2026-01-01', '2026-12-31', 120000000.00, 'active'),
('ctr-002', 'CV. Tirta Kencana', 'Pembersihan & Distribusi Air Bersih', '2026-03-01', '2026-09-30', 45000000.00, 'active');

-- --------------------------------------------------------

--
-- Struktur dari tabel `fasilitas`
--

CREATE TABLE `fasilitas` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `fasilitas`
--

INSERT INTO `fasilitas` (`id`, `name`, `category`) VALUES
('fas-1', 'Masjid / Mushola', 'Ibadah'),
('fas-1782281322246', 'Parkir', 'Umum'),
('fas-2', 'Taman Bermain Anak', 'Sosial'),
('fas-3', 'Klinik Kesehatan', 'Kesehatan'),
('fas-4', 'Pusat Olahraga Outdoor', 'Kebugaran');

-- --------------------------------------------------------

--
-- Struktur dari tabel `inspections`
--

CREATE TABLE `inspections` (
  `id` varchar(50) NOT NULL,
  `area` varchar(255) NOT NULL,
  `inspector` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `findings` text NOT NULL,
  `urgency` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `inspections`
--

INSERT INTO `inspections` (`id`, `area`, `inspector`, `date`, `findings`, `urgency`, `status`) VALUES
('ins-001', 'Area Parkir Block A', 'Sulaeman (UPRS)', '2026-06-15', 'Paving block amblas sepanjang 3 meter dekat pintu masuk.', 'Medium', 'scheduled'),
('ins-002', 'Pompa Utama Marunda', 'Dedi (Teknisi)', '2026-06-21', 'Ditemukan keausan pada seal impeller pompa 2. Butuh penggantian.', 'High', 'completed');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kecamatan`
--

CREATE TABLE `kecamatan` (
  `id` varchar(50) NOT NULL,
  `kota_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kecamatan`
--

INSERT INTO `kecamatan` (`id`, `kota_id`, `name`) VALUES
('kec-01', 'kota-3172', 'Cilincing'),
('kec-02', 'kota-3175', 'Duren Sawit'),
('kec-1782283018533', 'kot-1782282885637', 'Jagakarsa');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kelurahan`
--

CREATE TABLE `kelurahan` (
  `id` varchar(50) NOT NULL,
  `kec_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kelurahan`
--

INSERT INTO `kelurahan` (`id`, `kec_id`, `name`) VALUES
('kel-01', 'kec-01', 'Marunda'),
('kel-02', 'kec-02', 'Pondok Kelapa');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kota`
--

CREATE TABLE `kota` (
  `id` varchar(50) NOT NULL,
  `prov_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kota`
--

INSERT INTO `kota` (`id`, `prov_id`, `name`) VALUES
('kot-1782282885637', 'prov-31', 'Jakarta Selatan'),
('kota-3171', 'prov-31', 'Jakarta Pusat'),
('kota-3172', 'prov-31', 'Jakarta Utara'),
('kota-3175', 'prov-31', 'Jakarta Timur');

-- --------------------------------------------------------

--
-- Struktur dari tabel `provinsi`
--

CREATE TABLE `provinsi` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `provinsi`
--

INSERT INTO `provinsi` (`id`, `name`) VALUES
('prov-31', 'DKI Jakarta');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rusun`
--

CREATE TABLE `rusun` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `rusun`
--

INSERT INTO `rusun` (`id`, `name`, `type`, `address`) VALUES
('rusun-1', 'Rusunawa Marunda', 'Rusunawa (Sewa)', 'Jl. Marunda Baru, Cilincing, Jakarta Utara'),
('rusun-1782272620881', 'Rusunawa Tebet', 'Rusunawa (Sewa)', 'Jl. Tebet Barat Raya No.120, RT.1/RW.8, West Tebet, Tebet, South Jakarta City, Jakarta 12810'),
('rusun-2', 'Rusunami Klapa Village', 'Rusunami (Milik)', 'Jl. H. Naman, Pondok Kelapa, Jakarta Timur');

-- --------------------------------------------------------

--
-- Struktur dari tabel `surveys`
--

CREATE TABLE `surveys` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `surveys`
--

INSERT INTO `surveys` (`id`, `title`, `description`, `active`) VALUES
('srv-001', 'Survei Kepuasan Layanan Rusun Q2 2026', 'Kuesioner evaluasi kebersihan, keamanan, dan respon perawatan.', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `survey_answers`
--

CREATE TABLE `survey_answers` (
  `id` varchar(50) NOT NULL,
  `response_id` varchar(50) NOT NULL,
  `question_id` varchar(50) NOT NULL,
  `answer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` varchar(50) NOT NULL,
  `survey_id` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `type` varchar(50) DEFAULT 'scale'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `survey_id`, `text`, `type`) VALUES
('q-1', 'srv-001', 'Bagaimana tanggapan Anda mengenai kebersihan area publik rusun?', 'scale'),
('q-2', 'srv-001', 'Apakah petugas keamanan merespon dengan cepat jika ada aduan?', 'scale'),
('q-3', 'srv-001', 'Tuliskan saran perbaikan untuk pengelola rusun:', 'text');

-- --------------------------------------------------------

--
-- Struktur dari tabel `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` varchar(50) NOT NULL,
  `survey_id` varchar(50) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `survey_responses`
--

INSERT INTO `survey_responses` (`id`, `survey_id`, `tenant_name`, `date`) VALUES
('res-001', 'srv-001', 'Ahmad Fauzi', '2026-06-18'),
('res-002', 'srv-001', 'Siti Rahma', '2026-06-20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tagihan`
--

CREATE TABLE `tagihan` (
  `id` varchar(50) NOT NULL,
  `unit_id` varchar(50) NOT NULL,
  `unit_number` varchar(20) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `month` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'unpaid',
  `due_date` date NOT NULL,
  `payment_date` date DEFAULT NULL,
  `proof` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `towers`
--

CREATE TABLE `towers` (
  `id` varchar(50) NOT NULL,
  `rusun_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `floor_count` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `towers`
--

INSERT INTO `towers` (`id`, `rusun_id`, `name`, `floor_count`) VALUES
('tow-1-a', 'rusun-1', 'Block A', 1),
('tow-1-b', 'rusun-1', 'Block B', 1),
('tow-1782272719401', 'rusun-1782272620881', 'Tower A', 1),
('tow-1782351540513', 'rusun-1782272620881', 'Tower B', 1),
('tow-1782362398023', 'rusun-1782272620881', 'Tower A', 2),
('tow-1782370390019', 'rusun-1', 'Block A', 2),
('tow-2-a', 'rusun-2', 'Tower Samawa', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `units`
--

CREATE TABLE `units` (
  `id` varchar(50) NOT NULL,
  `tower_id` varchar(50) NOT NULL,
  `number` varchar(20) NOT NULL,
  `floor` varchar(10) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `status` varchar(50) DEFAULT 'available',
  `tenant_name` varchar(255) DEFAULT NULL,
  `id;tower_id;number;floor;price;status;tenant_name` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `units`
--

INSERT INTO `units` (`id`, `tower_id`, `number`, `floor`, `price`, `status`, `tenant_name`, `id;tower_id;number;floor;price;status;tenant_name`) VALUES
('unit-1782272752233', 'tow-1782272719401', 'A-001', '1', 850000.00, 'booked', 'popi asmara', NULL),
('unit-1782349725457', 'tow-1782272719401', 'A-002', '1', 850000.00, 'available', '', NULL),
('unit-1782349778825', 'tow-1782272719401', 'A-003', '1', 850000.00, 'available', '', NULL),
('unit-1782351594833', 'tow-1782351540513', 'B-101', '1', 850000.00, 'available', '', NULL),
('unit-1782356411764', 'tow-1-a', 'A-001', '1', 450000.00, 'available', '', NULL),
('unit-1782356432259', 'tow-1-b', 'B-001', '1', 450000.00, 'available', '', NULL),
('unit-1782356452252', 'tow-2-a', 'S-001', '1', 550000.00, 'available', '', NULL),
('unit-1782356482476', 'tow-2-a', 's-001', '2', 550000.00, 'available', '', NULL),
('unit-1782356526668', 'tow-1-a', 'A-002', '1', 600000.00, 'available', '', NULL),
('unit-1782356539957', 'tow-1-b', 'b-002', '1', 400000.00, 'available', '', NULL),
('unit-1782370911107', 'tow-1782370390019', 'A-201', '2', 450000.00, 'available', '', NULL),
('unit-1782370947459', 'tow-1782362398023', 'A-201', '2', 500000.00, 'available', '', NULL),
('unit-1782371456812', 'tow-1782272719401', 'A-104', '1', 500000.00, 'available', '', NULL),
('unit-1782371465067', 'tow-1782272719401', 'A-105', '1', 800000.00, 'available', '', NULL),
('unit-1782371471187', 'tow-1782272719401', 'A-106', '1', 500000.00, 'available', '', NULL),
('unit-1782371479107', 'tow-1782272719401', 'A-107', '1', 700000.00, 'available', '', NULL),
('unit-1782371486074', 'tow-1782272719401', 'A-108', '1', 900000.00, 'available', '', NULL),
('unit-1782371498155', 'tow-1782272719401', 'A-109', '1', 550000.00, 'available', '', NULL),
('unit-1782371517004', 'tow-1782272719401', 'A-110', '1', 700000.00, 'available', '', NULL),
('unit-1782371523052', 'tow-1782272719401', 'A-111', '1', 700000.00, 'available', '', NULL),
('unit-1782371529723', 'tow-1782272719401', 'A-112', '1', 700000.00, 'available', '', NULL),
('unit-1782371602219', 'tow-1782272719401', 'A-113', '1', 400000.00, 'available', '', NULL),
('unit-1782371608539', 'tow-1782272719401', 'A-114', '1', 400000.00, 'available', '', NULL),
('unit-1782371614051', 'tow-1782272719401', 'A-115', '1', 500000.00, 'available', '', NULL),
('unit-1782371621564', 'tow-1782272719401', 'A-116', '1', 350000.00, 'available', '', NULL),
('unit-1782371626747', 'tow-1782272719401', 'A-117', '1', 500000.00, 'available', '', NULL),
('unit-1782371632218', 'tow-1782272719401', 'A-118', '1', 750000.00, 'available', '', NULL),
('unit-1782371637283', 'tow-1782272719401', 'A-119', '1', 500000.00, 'available', '', NULL),
('unit-1782371646611', 'tow-1782272719401', 'A-120', '1', 400000.00, 'available', '', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `unit_id` varchar(50) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `email`, `phone`, `unit_id`, `active`) VALUES
('usr-001', 'admin', 'admin123', 'Administrator', 'administrator', 'admin@sirukim.go.id', NULL, NULL, 1),
('usr-002', 'dinas_entry', 'dinas123', 'Rian Hidayat', 'entry_data', 'rian.entry@sirukim.go.id', NULL, NULL, 1),
('usr-003', 'uprs_perawatan', 'uprs123', 'UPRS Wilayah I', 'uprs_perawatan', 'uprs.w1@sirukim.go.id', NULL, NULL, 1),
('usr-004', 'penghuni_budi', 'budi123', 'Budi Santoso', 'penghuni', 'budi.santoso@gmail.com', '081234567890', 'unit-101', 1),
('usr-005', 'pimpinan_dinas', 'pimpinan123', 'Ir. Jaka Widaya', 'pimpinan_dinas', 'jakawidaya@sirukim.go.id', NULL, NULL, 1),
('usr-1782272122169', 'popi', '123', 'popi asmara', 'penghuni', 'popi@gmail.com', NULL, NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `anggota_keluarga`
--
ALTER TABLE `anggota_keluarga`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rusun_id` (`rusun_id`),
  ADD KEY `tower_id` (`tower_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indeks untuk tabel `btpp`
--
ALTER TABLE `btpp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indeks untuk tabel `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indeks untuk tabel `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `fasilitas`
--
ALTER TABLE `fasilitas`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `inspections`
--
ALTER TABLE `inspections`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `kecamatan`
--
ALTER TABLE `kecamatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kota_id` (`kota_id`);

--
-- Indeks untuk tabel `kelurahan`
--
ALTER TABLE `kelurahan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kec_id` (`kec_id`);

--
-- Indeks untuk tabel `kota`
--
ALTER TABLE `kota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prov_id` (`prov_id`);

--
-- Indeks untuk tabel `provinsi`
--
ALTER TABLE `provinsi`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `rusun`
--
ALTER TABLE `rusun`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `survey_answers`
--
ALTER TABLE `survey_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `response_id` (`response_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indeks untuk tabel `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_id` (`survey_id`);

--
-- Indeks untuk tabel `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_id` (`survey_id`);

--
-- Indeks untuk tabel `tagihan`
--
ALTER TABLE `tagihan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indeks untuk tabel `towers`
--
ALTER TABLE `towers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_towers_rusun` (`rusun_id`);

--
-- Indeks untuk tabel `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tower_id` (`tower_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `anggota_keluarga`
--
ALTER TABLE `anggota_keluarga`
  ADD CONSTRAINT `anggota_keluarga_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`rusun_id`) REFERENCES `rusun` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tower_id`) REFERENCES `towers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `btpp`
--
ALTER TABLE `btpp`
  ADD CONSTRAINT `btpp_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kecamatan`
--
ALTER TABLE `kecamatan`
  ADD CONSTRAINT `kecamatan_ibfk_1` FOREIGN KEY (`kota_id`) REFERENCES `kota` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kelurahan`
--
ALTER TABLE `kelurahan`
  ADD CONSTRAINT `kelurahan_ibfk_1` FOREIGN KEY (`kec_id`) REFERENCES `kecamatan` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kota`
--
ALTER TABLE `kota`
  ADD CONSTRAINT `kota_ibfk_1` FOREIGN KEY (`prov_id`) REFERENCES `provinsi` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `survey_answers`
--
ALTER TABLE `survey_answers`
  ADD CONSTRAINT `survey_answers_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `survey_responses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `survey_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD CONSTRAINT `survey_questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD CONSTRAINT `survey_responses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tagihan`
--
ALTER TABLE `tagihan`
  ADD CONSTRAINT `tagihan_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `towers`
--
ALTER TABLE `towers`
  ADD CONSTRAINT `fk_towers_rusun` FOREIGN KEY (`rusun_id`) REFERENCES `rusun` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `towers_ibfk_1` FOREIGN KEY (`rusun_id`) REFERENCES `rusun` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`tower_id`) REFERENCES `towers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
