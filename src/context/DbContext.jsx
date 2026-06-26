import React, { createContext, useContext, useState, useEffect } from 'react';

const DbContext = createContext();

export const useDb = () => useContext(DbContext);

const INITIAL_USERS = [
  { id: 'usr-001', username: 'admin', name: 'Administrator Utama', role: 'administrator', email: 'admin@sirukim.go.id', password: 'sirukim123', active: true },
  { id: 'usr-002', username: 'dinas_entry', name: 'Rian Hidayat (Entry)', role: 'entry_data', email: 'rian.entry@sirukim.go.id', password: 'sirukim123', active: true },
  { id: 'usr-003', username: 'uprs_perawatan', name: 'UPRS Wilayah I', role: 'uprs_perawatan', email: 'uprs.w1@sirukim.go.id', password: 'sirukim123', active: true },
  { id: 'usr-004', username: 'penghuni_budi', name: 'Budi Santoso', role: 'penghuni', email: 'budi.santoso@gmail.com', phone: '081234567890', password: 'sirukim123', unitId: 'unit-101', active: true },
  { id: 'usr-005', username: 'pimpinan_dinas', name: 'Dr. Ir. H. Heru Wahyudi (Kadis)', role: 'pimpinan_dinas', email: 'heru.wahyudi@sirukim.go.id', password: 'sirukim123', active: true },
];

const normalizeIdentity = (value) => (value || '').trim().toLowerCase();

const findInitialUserMatch = (user) => {
  const normalizedUsername = normalizeIdentity(user?.username);
  const normalizedEmail = normalizeIdentity(user?.email);

  return INITIAL_USERS.find((item) => (
    (user?.id && item.id === user.id) ||
    (normalizedUsername && normalizeIdentity(item.username) === normalizedUsername) ||
    (normalizedEmail && normalizeIdentity(item.email) === normalizedEmail)
  ));
};

const createUserKey = (user) => {
  if (user?.id) return `id:${user.id}`;

  const normalizedUsername = normalizeIdentity(user?.username);
  if (normalizedUsername) return `username:${normalizedUsername}`;

  const normalizedEmail = normalizeIdentity(user?.email);
  if (normalizedEmail) return `email:${normalizedEmail}`;

  return null;
};

const migrateUsers = (storedUsers) => {
  if (!Array.isArray(storedUsers) || storedUsers.length === 0) {
    return INITIAL_USERS;
  }

  const cleanedUsers = [];
  const seenKeys = new Set();

  storedUsers.forEach((storedUser) => {
    if (!storedUser || typeof storedUser !== 'object') {
      return;
    }

    const matchedInitial = findInitialUserMatch(storedUser);
    const mergedUser = {
      ...matchedInitial,
      ...storedUser,
      username: storedUser.username?.trim() || matchedInitial?.username || '',
      email: storedUser.email?.trim() || matchedInitial?.email || '',
      name: storedUser.name?.trim() || matchedInitial?.name || '',
      phone: storedUser.phone?.trim?.() || matchedInitial?.phone,
      password: storedUser.password || matchedInitial?.password || '',
      active: typeof storedUser.active === 'boolean' ? storedUser.active : (matchedInitial?.active ?? true)
    };

    const identityKey = createUserKey(mergedUser);
    if (!identityKey || seenKeys.has(identityKey)) {
      return;
    }

    seenKeys.add(identityKey);
    cleanedUsers.push(mergedUser);
  });

  INITIAL_USERS.forEach((initialUser) => {
    const identityKey = createUserKey(initialUser);
    if (!identityKey || seenKeys.has(identityKey)) {
      return;
    }

    seenKeys.add(identityKey);
    cleanedUsers.push(initialUser);
  });

  return cleanedUsers;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost/sirukim/api').replace(/\/$/, '');

const toSqlDateTime = (date = new Date()) => date.toISOString().slice(0, 19).replace('T', ' ');

const INITIAL_RUSUN = [
  { 
    id: 'rusun-1', 
    name: 'Rusunawa Marunda', 
    type: 'Rusunawa (Sewa)',
    address: 'Jl. Marunda Baru, Cilincing, Jakarta Utara',
    towers: [
      { 
        id: 'tow-1-a', 
        name: 'Block A', 
        floorCount: 2,
        units: [
          { id: 'unit-101', number: 'A-101', floor: '1', price: 450000, status: 'occupied', tenantName: 'Budi Santoso' },
          { id: 'unit-102', number: 'A-102', floor: '1', price: 450000, status: 'available', tenantName: '' },
          { id: 'unit-103', number: 'A-103', floor: '1', price: 450000, status: 'maintenance', tenantName: '' },
          { id: 'unit-201', number: 'A-201', floor: '2', price: 475000, status: 'occupied', tenantName: 'Ahmad Fauzi' },
          { id: 'unit-202', number: 'A-202', floor: '2', price: 475000, status: 'available', tenantName: '' },
        ]
      },
      { 
        id: 'tow-1-b', 
        name: 'Block B', 
        floorCount: 1,
        units: [
          { id: 'unit-b101', number: 'B-101', floor: '1', price: 450000, status: 'occupied', tenantName: 'Siti Rahma' },
          { id: 'unit-b102', number: 'B-102', floor: '1', price: 450000, status: 'available', tenantName: '' },
        ]
      }
    ]
  },
  { 
    id: 'rusun-2', 
    name: 'Rusunami Klapa Village', 
    type: 'Rusunami (Milik)',
    address: 'Jl. H. Naman, Pondok Kelapa, Jakarta Timur',
    towers: [
      { 
        id: 'tow-2-a', 
        name: 'Tower Samawa', 
        floorCount: 1,
        units: [
          { id: 'unit-milik-101', number: 'S-101', floor: '1', price: 185000000, status: 'occupied', tenantName: 'Joko Widodo' },
          { id: 'unit-milik-102', number: 'S-102', floor: '1', price: 185000000, status: 'booked', tenantName: 'Diana Lestari' },
          { id: 'unit-milik-103', number: 'S-103', floor: '1', price: 185000000, status: 'available', tenantName: '' },
        ]
      }
    ]
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'bkg-101',
    applicantName: 'Diana Lestari',
    nik: '3174092108920005',
    email: 'diana.lestari@gmail.com',
    phone: '085712345678',
    rusunId: 'rusun-2',
    rusunName: 'Rusunami Klapa Village',
    towerId: 'tow-2-a',
    unitId: 'unit-milik-102',
    unitNumber: 'S-102',
    type: 'Rusunami Umum',
    status: 'pending_approval',
    createdAt: '2026-06-20T10:00:00Z',
    documents: {
      ktp: 'ktp_diana.pdf',
      kk: 'kk_diana.pdf',
      sktm: 'sktm_diana.pdf'
    }
  },
  {
    id: 'bkg-102',
    applicantName: 'Rudi Hartono',
    nik: '3172081504850002',
    email: 'rudi.hartono@yahoo.com',
    phone: '081398765432',
    rusunId: 'rusun-1',
    rusunName: 'Rusunawa Marunda',
    towerId: 'tow-1-a',
    unitId: 'unit-102',
    unitNumber: 'A-102',
    type: 'Rusunawa Relokasi',
    status: 'approved',
    createdAt: '2026-06-18T08:30:00Z',
    documents: {
      ktp: 'ktp_rudi.pdf',
      kk: 'kk_rudi.pdf',
      sktm: 'sktm_rudi.pdf'
    }
  }
];

const INITIAL_TAGIHAN = [
  { id: 'tag-001', unitId: 'unit-101', unitNumber: 'A-101', tenantName: 'Budi Santoso', type: 'Rent', amount: 450000, month: 'Juni 2026', status: 'unpaid', dueDate: '2026-06-10', paymentDate: null, proof: null },
  { id: 'tag-002', unitId: 'unit-101', unitNumber: 'A-101', tenantName: 'Budi Santoso', type: 'Utility (Air & Listrik)', amount: 125000, month: 'Juni 2026', status: 'paid', dueDate: '2026-06-10', paymentDate: '2026-06-08', proof: 'receipt_juni.jpg' },
  { id: 'tag-003', unitId: 'unit-201', unitNumber: 'A-201', tenantName: 'Ahmad Fauzi', type: 'Rent', amount: 475000, month: 'Juni 2026', status: 'paid', dueDate: '2026-06-10', paymentDate: '2026-06-05', proof: 'receipt_ahmad.jpg' },
  { id: 'tag-004', unitId: 'unit-101', unitNumber: 'A-101', tenantName: 'Budi Santoso', type: 'Rent', amount: 450000, month: 'Mei 2026', status: 'paid', dueDate: '2026-05-10', paymentDate: '2026-05-09', proof: 'receipt_mei.jpg' },
  { id: 'tag-005', unitId: 'unit-b101', number: 'B-101', tenantName: 'Siti Rahma', type: 'Rent', amount: 450000, month: 'Juni 2026', status: 'overdue', dueDate: '2026-06-05', paymentDate: null, proof: null }
];

const INITIAL_COMPLAINTS = [
  { id: 'cmp-001', senderId: 'usr-004', senderName: 'Budi Santoso', unitNumber: 'A-101', category: 'Fasilitas Air', description: 'Air PDAM di kamar mandi mati sejak kemarin sore. Mohon diperiksa pipa salurannya.', status: 'processing', createdAt: '2026-06-22T14:20:00Z', notes: 'Petugas sedang mengecek pipa utama di Block A.' },
  { id: 'cmp-002', senderId: 'usr-004', senderName: 'Budi Santoso', unitNumber: 'A-101', category: 'Kelistrikan', description: 'Sekring listrik sering anjlok jika menyalakan pompa air dan dispenser bersamaan.', status: 'submitted', createdAt: '2026-06-23T11:00:00Z', notes: '' },
  { id: 'cmp-003', senderId: 'usr-006', senderName: 'Ahmad Fauzi', unitNumber: 'A-201', category: 'Struktur Bangunan', description: 'Kebocoran atap dak beton saat hujan deras, air merembes ke langit-langit ruang tamu.', status: 'resolved', createdAt: '2026-06-10T09:00:00Z', notes: 'Sudah dilakukan pelapisan waterproofing sika pada dak beton lantai atas.' }
];

const INITIAL_CONTRACTS = [
  { id: 'ctr-001', vendorName: 'PT. Bangun Graha Mandiri', workType: 'Perawatan Lift & Elektrikal', startDate: '2026-01-01', endDate: '2026-12-31', budget: 120000000, status: 'active' },
  { id: 'ctr-002', vendorName: 'CV. Tirta Kencana', workType: 'Pembersihan & Distribusi Air Bersih', startDate: '2026-03-01', endDate: '2026-09-30', budget: 45000000, status: 'active' }
];

const INITIAL_INSPECTIONS = [
  { id: 'ins-001', area: 'Area Parkir Block A', inspector: 'Sulaeman (UPRS)', date: '2026-06-15', findings: 'Paving block amblas sepanjang 3 meter dekat pintu masuk.', status: 'scheduled', urgency: 'Medium' },
  { id: 'ins-002', area: 'Pompa Utama Marunda', inspector: 'Dedi (Teknisi)', date: '2026-06-21', findings: 'Ditemukan keausan pada seal impeller pompa 2. Butuh penggantian.', status: 'completed', urgency: 'High' }
];

const INITIAL_BTPP = [
  { id: 'btp-001', tenantName: 'Joko Widodo', unitId: 'unit-milik-101', unitNumber: 'S-101', status: 'approved', submissionDate: '2026-05-15', handoverDate: '2026-06-12', notes: 'Sertifikat dan kunci telah diserahterimakan.' },
  { id: 'btp-002', tenantName: 'Diana Lestari', unitId: 'unit-milik-102', unitNumber: 'S-102', status: 'pending', submissionDate: '2026-06-21', handoverDate: null, notes: 'Menunggu pelunasan berkas administrasi.' }
];

const INITIAL_SURVEYS = [
  { id: 'srv-001', title: 'Survei Kepuasan Layanan Rusun Q2 2026', description: 'Kuesioner evaluasi kebersihan, keamanan, dan respon perawatan.', active: true, questions: [
    { id: 'q-1', text: 'Bagaimana tanggapan Anda mengenai kebersihan area publik rusun?', type: 'scale' },
    { id: 'q-2', text: 'Apakah petugas keamanan merespon dengan cepat jika ada aduan?', type: 'scale' },
    { id: 'q-3', text: 'Tuliskan saran perbaikan untuk pengelola rusun:', type: 'text' }
  ]}
];

const INITIAL_SURVEY_RESPONSES = [
  { id: 'res-001', surveyId: 'srv-001', tenantName: 'Ahmad Fauzi', answers: { 'q-1': 4, 'q-2': 5, 'q-3': 'Kebersihan koridor sudah baik, tolong pertahankan.' }, date: '2026-06-18' },
  { id: 'res-002', surveyId: 'srv-001', tenantName: 'Siti Rahma', answers: { 'q-1': 3, 'q-2': 4, 'q-3': 'Tolong tertibkan parkir sepeda motor liar.' }, date: '2026-06-20' }
];

const INITIAL_METADATA = {
  provinsi: [
    { id: 'prov-31', name: 'DKI Jakarta' },
    { id: 'prov-32', name: 'Jawa Barat' }
  ],
  kota: [
    { id: 'kota-3171', provId: 'prov-31', name: 'Jakarta Pusat' },
    { id: 'kota-3172', provId: 'prov-31', name: 'Jakarta Utara' },
    { id: 'kota-3175', provId: 'prov-31', name: 'Jakarta Timur' }
  ],
  kecamatan: [
    { id: 'kec-01', kotaId: 'kota-3172', name: 'Cilincing' },
    { id: 'kec-02', kotaId: 'kota-3175', name: 'Duren Sawit' }
  ],
  kelurahan: [
    { id: 'kel-01', kecId: 'kec-01', name: 'Marunda' },
    { id: 'kel-02', kecId: 'kec-02', name: 'Pondok Kelapa' }
  ],
  fasilitas: [
    { id: 'fas-1', name: 'Masjid / Mushola', category: 'Ibadah' },
    { id: 'fas-2', name: 'Taman Bermain Anak', category: 'Sosial' },
    { id: 'fas-3', name: 'Klinik Kesehatan', category: 'Kesehatan' },
    { id: 'fas-4', name: 'Pusat Olahraga Outdoor', category: 'Kebugaran' }
  ]
};

const INITIAL_ANGGOTA_KELUARGA = [
  {
    id: 'kel-usr-004-1',
    userId: 'usr-004',
    nik: '3174090101900001',
    namaLengkap: 'Budi Santoso',
    tanggalLahir: '1990-01-01',
    jenisKelamin: 'Laki-laki'
  }
];

export const DbProvider = ({ children }) => {
  // Load state from local storage or fallback to initials
  const [users, setUsers] = useState(() => migrateUsers(JSON.parse(localStorage.getItem('sirukim_users'))));
  const [rusun, setRusun] = useState(() => JSON.parse(localStorage.getItem('sirukim_rusun')) || INITIAL_RUSUN);
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem('sirukim_bookings')) || INITIAL_BOOKINGS);
  const [tagihan, setTagihan] = useState(() => JSON.parse(localStorage.getItem('sirukim_tagihan')) || INITIAL_TAGIHAN);
  const [complaints, setComplaints] = useState(() => JSON.parse(localStorage.getItem('sirukim_complaints')) || INITIAL_COMPLAINTS);
  const [contracts, setContracts] = useState(() => JSON.parse(localStorage.getItem('sirukim_contracts')) || INITIAL_CONTRACTS);
  const [inspections, setInspections] = useState(() => JSON.parse(localStorage.getItem('sirukim_inspections')) || INITIAL_INSPECTIONS);
  const [btpp, setBtpp] = useState(() => JSON.parse(localStorage.getItem('sirukim_btpp')) || INITIAL_BTPP);
  const [surveys, setSurveys] = useState(() => JSON.parse(localStorage.getItem('sirukim_surveys')) || INITIAL_SURVEYS);
  const [surveyResponses, setSurveyResponses] = useState(() => JSON.parse(localStorage.getItem('sirukim_survey_responses')) || INITIAL_SURVEY_RESPONSES);
  const [metadata, setMetadata] = useState(() => JSON.parse(localStorage.getItem('sirukim_metadata')) || INITIAL_METADATA);
  const [anggotaKeluarga, setAnggotaKeluarga] = useState(() => JSON.parse(localStorage.getItem('sirukim_anggota_keluarga')) || INITIAL_ANGGOTA_KELUARGA);
  const [activityLogs, setActivityLogs] = useState(() => JSON.parse(localStorage.getItem('sirukim_activity_logs')) || []);

  // Current active user simulation
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUserId = localStorage.getItem('sirukim_session_user_id');
    if (!savedUserId) return null;
    const seededUsers = migrateUsers(JSON.parse(localStorage.getItem('sirukim_users')));
    return seededUsers.find((u) => u.id === savedUserId) || null;
  });

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.message || 'Operasi API gagal.');
    }

    return payload;
  };

  const persistCreate = (table, data) => apiRequest('/crud.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', table, data })
  });

  const persistUpdate = (table, id, data) => apiRequest('/crud.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update', table, id, data })
  });

  const persistDelete = (table, id) => apiRequest('/crud.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', table, id })
  });

  const safePersist = (promise) => {
    promise.catch((error) => {
      console.error('Persist DB gagal:', error.message);
    });
  };

  const pushActivityLog = (title, detail, type = 'admin') => {
    const entry = {
      id: `act-${Date.now()}`,
      title,
      detail,
      type,
      createdAt: new Date().toISOString()
    };

    setActivityLogs((prev) => [entry, ...prev].slice(0, 10));
  };

  const getTowerCode = (towerName = '') => {
    const segments = towerName.trim().split(/\s+/).filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    const code = lastSegment.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase();
    return code || 'U';
  };

  const generateNextUnitNumber = (rusunId, towerId, floor) => {
    const selectedRusun = rusun.find((item) => item.id === rusunId);
    const selectedTower = selectedRusun?.towers.find((item) => item.id === towerId);
    if (!selectedTower) return '';

    const floorValue = String(floor || '1').trim();
    const towerCode = getTowerCode(selectedTower.name);
    const matchingUnits = selectedTower.units.filter((unit) => String(unit.floor).trim() === floorValue);

    const nextSequence = matchingUnits.reduce((highest, unit) => {
      const unitNumber = String(unit.number || '');
      const suffix = unitNumber.split('-').pop() || '';
      const parsedSequence = Number.parseInt(suffix.slice(-2), 10);
      return Number.isFinite(parsedSequence) && parsedSequence > highest ? parsedSequence : highest;
    }, 0) + 1;

    return `${towerCode}-${floorValue}${String(nextSequence).padStart(2, '0')}`;
  };

  // Sync back to local storage whenever a state updates
  useEffect(() => { localStorage.setItem('sirukim_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sirukim_rusun', JSON.stringify(rusun)); }, [rusun]);
  useEffect(() => { localStorage.setItem('sirukim_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('sirukim_tagihan', JSON.stringify(tagihan)); }, [tagihan]);
  useEffect(() => { localStorage.setItem('sirukim_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('sirukim_contracts', JSON.stringify(contracts)); }, [contracts]);
  useEffect(() => { localStorage.setItem('sirukim_inspections', JSON.stringify(inspections)); }, [inspections]);
  useEffect(() => { localStorage.setItem('sirukim_btpp', JSON.stringify(btpp)); }, [btpp]);
  useEffect(() => { localStorage.setItem('sirukim_surveys', JSON.stringify(surveys)); }, [surveys]);
  useEffect(() => { localStorage.setItem('sirukim_survey_responses', JSON.stringify(surveyResponses)); }, [surveyResponses]);
  useEffect(() => { localStorage.setItem('sirukim_metadata', JSON.stringify(metadata)); }, [metadata]);
  useEffect(() => { localStorage.setItem('sirukim_anggota_keluarga', JSON.stringify(anggotaKeluarga)); }, [anggotaKeluarga]);
  useEffect(() => { localStorage.setItem('sirukim_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

  useEffect(() => {
    let mounted = true;

    apiRequest('/load.php', { method: 'GET' })
      .then((payload) => {
        if (!mounted) return;

        const dbData = payload.data || {};
        const dbUsers = migrateUsers(dbData.users);
        setUsers(dbUsers);
        if (Array.isArray(dbData.rusun)) setRusun(dbData.rusun);
        if (Array.isArray(dbData.bookings)) setBookings(dbData.bookings);
        if (Array.isArray(dbData.tagihan)) setTagihan(dbData.tagihan);
        if (Array.isArray(dbData.complaints)) setComplaints(dbData.complaints);
        if (Array.isArray(dbData.contracts)) setContracts(dbData.contracts);
        if (Array.isArray(dbData.inspections)) setInspections(dbData.inspections);
        if (Array.isArray(dbData.btpp)) setBtpp(dbData.btpp);
        if (Array.isArray(dbData.surveys)) setSurveys(dbData.surveys);
        if (Array.isArray(dbData.surveyResponses)) setSurveyResponses(dbData.surveyResponses);
        if (dbData.metadata) setMetadata(dbData.metadata);
        if (Array.isArray(dbData.anggotaKeluarga)) setAnggotaKeluarga(dbData.anggotaKeluarga);

        setCurrentUser((prev) => {
          if (!prev?.id) return null;
          return dbUsers.find((u) => u.id === prev.id) || null;
        });
      })
      .catch((error) => {
        console.error('Gagal sinkron data database:', error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const assignUnitToUserFromBooking = (booking) => {
    if (!booking?.unitId) return;

    let matchedUserId = null;
    setUsers((prev) => prev.map((u) => {
      const byEmail = booking.email && normalizeIdentity(u.email) === normalizeIdentity(booking.email);
      const byName = normalizeIdentity(u.name) === normalizeIdentity(booking.applicantName);
      if (byEmail || byName) {
        matchedUserId = u.id;
        return { ...u, unitId: booking.unitId };
      }
      return u;
    }));

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const byEmail = booking.email && normalizeIdentity(prev.email) === normalizeIdentity(booking.email);
      const byName = normalizeIdentity(prev.name) === normalizeIdentity(booking.applicantName);
      if (byEmail || byName) {
        return { ...prev, unitId: booking.unitId };
      }
      return prev;
    });

    if (matchedUserId) {
      safePersist(persistUpdate('users', matchedUserId, { unit_id: booking.unitId }));
    }
  };

  const changeRole = (roleName) => {
    const matched = users.find(u => u.role === roleName) || INITIAL_USERS.find(u => u.role === roleName);
    if (matched) {
      setCurrentUser(matched);
    } else {
      // Create temporary mock user for the role
      const tempUser = { id: `temp-${roleName}`, username: `user_${roleName}`, name: `Mock ${roleName.replace('_', ' ').toUpperCase()}`, role: roleName };
      setCurrentUser(tempUser);
    }
  };

  const setCurrentUserById = (userId) => {
    if (!userId) return false;
    const matched = users.find((u) => u.id === userId) || null;
    setCurrentUser(matched);
    return Boolean(matched);
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const authenticateUser = async (identifier, password) => {
    const normalizedIdentifier = normalizeIdentity(identifier);

    try {
      const payload = await apiRequest('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (payload.user) {
        setCurrentUser(payload.user);
        return { ok: true, user: payload.user };
      }

      // API responded but returned no user — fall through to local auth
      throw new Error('API tidak mengembalikan data user.');
    } catch (error) {
      const matched = users.find((user) => (
        normalizeIdentity(user.username) === normalizedIdentifier ||
        normalizeIdentity(user.email) === normalizedIdentifier
      ));

      if (matched && matched.password === password && matched.active !== false) {
        setCurrentUser(matched);
        return { ok: true, user: matched };
      }

      return { ok: false, message: error.message || 'Login gagal. Periksa kredensial Anda.' };
    }
  };

  const registerResident = async (userData) => {
    const normalizedUsername = normalizeIdentity(userData.username);
    const normalizedEmail = normalizeIdentity(userData.email);

    const duplicate = users.find((user) => (
      normalizeIdentity(user.username) === normalizedUsername || normalizeIdentity(user.email) === normalizedEmail
    ));

    if (duplicate) {
      return { ok: false, message: 'Username atau email sudah terdaftar.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      username: normalizedUsername,
      name: userData.name.trim(),
      role: 'penghuni',
      email: normalizedEmail,
      phone: userData.phone.trim(),
      password: userData.password,
      active: true
    };

    try {
      await persistCreate('users', {
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        phone: newUser.phone,
        unit_id: newUser.unitId || null,
        active: newUser.active ? 1 : 0
      });
    } catch (error) {
      return { ok: false, message: error.message };
    }

    setUsers((prev) => [...prev, newUser]);

    return { ok: true, user: newUser };
  };

  // --- ADMINISTRATOR OPERATIONS ---
  const addUser = (userData) => {
    const newUser = { ...userData, id: `usr-${Date.now()}`, active: true };
    setUsers(prev => [...prev, newUser]);
    safePersist(persistCreate('users', {
      id: newUser.id,
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      phone: newUser.phone || null,
      unit_id: newUser.unitId || null,
      active: newUser.active ? 1 : 0
    }));
  };
  const updateUser = (id, updatedFields) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedFields } : u));
    safePersist(persistUpdate('users', id, {
      ...('username' in updatedFields ? { username: updatedFields.username } : {}),
      ...('password' in updatedFields ? { password: updatedFields.password } : {}),
      ...('name' in updatedFields ? { name: updatedFields.name } : {}),
      ...('role' in updatedFields ? { role: updatedFields.role } : {}),
      ...('email' in updatedFields ? { email: updatedFields.email } : {}),
      ...('phone' in updatedFields ? { phone: updatedFields.phone } : {}),
      ...('unitId' in updatedFields ? { unit_id: updatedFields.unitId } : {}),
      ...('active' in updatedFields ? { active: updatedFields.active ? 1 : 0 } : {})
    }));
  };
  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    safePersist(persistDelete('users', id));
  };

  // Location/Metadata operations
  const addMetadataItem = (key, item) => {
    const newItem = (() => {
      const base = { id: `${key.substring(0, 3)}-${Date.now()}`, name: item.name };

      if (key === 'kota') return { ...base, provId: item.parentId };
      if (key === 'kecamatan') return { ...base, kotaId: item.parentId };
      if (key === 'kelurahan') return { ...base, kecId: item.parentId };
      if (key === 'fasilitas') return { ...base, category: item.category };

      return base;
    })();

    setMetadata(prev => ({
      ...prev,
      [key]: [...prev[key], newItem]
    }));

    const metadataMap = {
      provinsi: { table: 'provinsi', map: (x) => ({ id: x.id, name: x.name }) },
      kota: { table: 'kota', map: (x) => ({ id: x.id, prov_id: x.provId, name: x.name }) },
      kecamatan: { table: 'kecamatan', map: (x) => ({ id: x.id, kota_id: x.kotaId, name: x.name }) },
      kelurahan: { table: 'kelurahan', map: (x) => ({ id: x.id, kec_id: x.kecId, name: x.name }) },
      fasilitas: { table: 'fasilitas', map: (x) => ({ id: x.id, name: x.name, category: x.category }) }
    };

    const target = metadataMap[key];
    if (target) {
      safePersist(persistCreate(target.table, target.map(newItem)));
      pushActivityLog('Data wilayah ditambahkan', `${key}: ${newItem.name}`, 'admin');
    }
  };
  const deleteMetadataItem = (key, id) => {
    setMetadata(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));

    const metadataTableMap = {
      provinsi: 'provinsi',
      kota: 'kota',
      kecamatan: 'kecamatan',
      kelurahan: 'kelurahan',
      fasilitas: 'fasilitas'
    };
    if (metadataTableMap[key]) {
      safePersist(persistDelete(metadataTableMap[key], id));
      pushActivityLog('Data wilayah dihapus', `${key}: ${id}`, 'admin');
    }
  };

  const addQuestionnaire = (title, desc, qs) => {
    const surveyId = `srv-${Date.now()}`;
    const normalizedQs = qs.map((q, idx) => ({
      id: q.id || `q-${Date.now()}-${idx}`,
      text: q.text,
      type: q.type || 'scale'
    }));

    setSurveys(prev => [...prev, { id: surveyId, title, description: desc, active: true, questions: normalizedQs }]);

    safePersist(persistCreate('surveys', {
      id: surveyId,
      title,
      description: desc,
      active: 1
    }));

    normalizedQs.forEach((q) => {
      safePersist(persistCreate('survey_questions', {
        id: q.id,
        survey_id: surveyId,
        text: q.text,
        type: q.type
      }));
    });
  };
  const toggleSurveyActive = (id) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextActive = !s.active;
      safePersist(persistUpdate('surveys', id, { active: nextActive ? 1 : 0 }));
      return { ...s, active: nextActive };
    }));
  };

  // --- ENTRY DATA / ADMIN DINAS OPERATIONS ---
  const addRusun = (name, type, address) => {
    const newRusun = { id: `rusun-${Date.now()}`, name, type, address, towers: [] };
    setRusun(prev => [...prev, newRusun]);
    safePersist(persistCreate('rusun', newRusun));
  };
  
  const addTower = (rusunId, name, floorCount = 1) => {
    const newTower = { id: `tow-${Date.now()}`, name, floorCount: Number(floorCount) || 1, units: [] };
    setRusun(prev => prev.map(r => {
      if (r.id === rusunId) {
        return {
          ...r,
          towers: [...r.towers, newTower]
        };
      }
      return r;
    }));

    safePersist(persistCreate('towers', {
      id: newTower.id,
      rusun_id: rusunId,
      name,
      floor_count: newTower.floorCount
    }));
  };

  const updateTower = (towerId, updatedFields) => {
    setRusun((prev) => prev.map((item) => ({
      ...item,
      towers: item.towers.map((tower) => {
        if (tower.id !== towerId) return tower;

        const nextTower = {
          ...tower,
          ...updatedFields,
          floorCount: Number(updatedFields.floorCount ?? updatedFields.floor_count ?? tower.floorCount ?? tower.floor_count ?? 1) || 1
        };

        delete nextTower.floor_count;
        return nextTower;
      })
    })));

    safePersist(persistUpdate('towers', towerId, {
      ...('rusunId' in updatedFields ? { rusun_id: updatedFields.rusunId } : {}),
      ...('name' in updatedFields ? { name: updatedFields.name } : {}),
      ...('floorCount' in updatedFields || 'floor_count' in updatedFields ? { floor_count: Number(updatedFields.floorCount ?? updatedFields.floor_count ?? 1) || 1 } : {})
    }));
  };

  const deleteTower = (towerId) => {
    setRusun((prev) => prev.map((item) => ({
      ...item,
      towers: item.towers.filter((tower) => tower.id !== towerId)
    })));

    safePersist(persistDelete('towers', towerId));
  };

  const addUnit = (rusunId, towerId, number, floor, price) => {
    const selectedRusun = rusun.find((item) => item.id === rusunId);
    const selectedTower = selectedRusun?.towers.find((item) => item.id === towerId);
    const finalFloor = String(floor || '1').trim();
    const finalNumber = String(number || '').trim() || generateNextUnitNumber(rusunId, towerId, finalFloor);
    const newUnit = { id: `unit-${Date.now()}`, number: finalNumber, floor: finalFloor, price: parseFloat(price), status: 'available', tenantName: '' };
    setRusun(prev => prev.map(r => {
      if (r.id === rusunId) {
        return {
          ...r,
          towers: r.towers.map(t => {
            if (t.id === towerId) {
              return {
                ...t,
                units: [...t.units, newUnit]
              };
            }
            return t;
          })
        };
      }
      return r;
    }));

    safePersist(persistCreate('units', {
      id: newUnit.id,
      tower_id: towerId,
      number: newUnit.number,
      floor: finalFloor,
      price: newUnit.price,
      status: 'available',
      tenant_name: ''
    }));
  };

  const changeUnitStatus = (unitId, status, tenantName = '') => {
    setRusun(prev => prev.map(r => ({
      ...r,
      towers: r.towers.map(t => ({
        ...t,
        units: t.units.map(u => u.id === unitId ? { ...u, status, tenantName } : u)
      }))
    })));

    safePersist(persistUpdate('units', unitId, {
      status,
      tenant_name: tenantName
    }));
  };

  // --- UPRS & PERAWATAN OPERATIONS ---
  const addContract = (vendorName, workType, startDate, endDate, budget) => {
    const newContract = { id: `ctr-${Date.now()}`, vendorName, workType, startDate, endDate, budget: parseFloat(budget), status: 'active' };
    setContracts(prev => [...prev, newContract]);
    safePersist(persistCreate('contracts', {
      id: newContract.id,
      vendor_name: newContract.vendorName,
      work_type: newContract.workType,
      start_date: newContract.startDate,
      end_date: newContract.endDate,
      budget: newContract.budget,
      status: newContract.status
    }));
  };

  const addInspection = (area, inspector, date, findings, urgency) => {
    const newInspection = { id: `ins-${Date.now()}`, area, inspector, date, findings, urgency, status: 'scheduled' };
    setInspections(prev => [...prev, newInspection]);
    safePersist(persistCreate('inspections', newInspection));
  };

  const updateInspectionStatus = (id, status) => {
    setInspections(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    safePersist(persistUpdate('inspections', id, { status }));
  };

  // Set resident matching (lottery results)
  const drawLotteryAndAssign = (bookingId, unitId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // 1. Approve booking
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
    safePersist(persistUpdate('bookings', bookingId, { status: 'approved' }));
    
    // 2. Set unit status to occupied
    changeUnitStatus(unitId, 'occupied', booking.applicantName);
    assignUnitToUserFromBooking({ ...booking, unitId });

    // 3. Create initial tagihan
    const billAmount = 450000; // standard default
    const newTagihanId = `tag-${Date.now()}`;
    setTagihan(prev => [...prev, {
      id: newTagihanId,
      unitId,
      unitNumber: booking.unitNumber,
      tenantName: booking.applicantName,
      type: 'Rent',
      amount: billAmount,
      month: 'Juli 2026',
      status: 'unpaid',
      dueDate: '2026-07-10',
      paymentDate: null,
      proof: null
    }]);

    const newTagihan = {
      id: newTagihanId,
      unit_id: unitId,
      unit_number: booking.unitNumber,
      tenant_name: booking.applicantName,
      type: 'Rent',
      amount: billAmount,
      month: 'Juli 2026',
      status: 'unpaid',
      due_date: '2026-07-10',
      payment_date: null,
      proof: null
    };
    safePersist(persistCreate('tagihan', newTagihan));
  };

  // --- PENGHUNI RUSUN OPERATIONS ---
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: `bkg-${Date.now()}`,
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [...prev, newBooking]);
    safePersist(persistCreate('bookings', {
      id: newBooking.id,
      applicant_name: newBooking.applicantName,
      nik: newBooking.nik,
      email: newBooking.email,
      phone: newBooking.phone,
      rusun_id: newBooking.rusunId,
      rusun_name: newBooking.rusunName,
      tower_id: newBooking.towerId,
      unit_id: newBooking.unitId,
      unit_number: newBooking.unitNumber,
      type: newBooking.type,
      status: newBooking.status,
      created_at: toSqlDateTime(new Date(newBooking.createdAt))
    }));
    // Set unit status to booked
    changeUnitStatus(bookingData.unitId, 'booked', bookingData.applicantName);
  };

  const payBill = (tagihanId, receiptFileName) => {
    const paidDate = new Date().toISOString().split('T')[0];
    setTagihan(prev => prev.map(t => {
      if (t.id === tagihanId) {
        return {
          ...t,
          status: 'paid',
          paymentDate: paidDate,
          proof: receiptFileName
        };
      }
      return t;
    }));

    safePersist(persistUpdate('tagihan', tagihanId, {
      status: 'paid',
      payment_date: paidDate,
      proof: receiptFileName
    }));
  };

  const addComplaint = (category, description) => {
    const selectedUnit = rusun
      .flatMap((r) => r.towers.flatMap((t) => t.units))
      .find((u) => u.id === currentUser.unitId);

    const newComp = {
      id: `cmp-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      unitNumber: selectedUnit?.number || 'Belum Ditetapkan',
      category,
      description,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    setComplaints(prev => [newComp, ...prev]);
    safePersist(persistCreate('complaints', {
      id: newComp.id,
      sender_id: newComp.senderId,
      sender_name: newComp.senderName,
      unit_number: newComp.unitNumber,
      category: newComp.category,
      description: newComp.description,
      status: newComp.status,
      created_at: toSqlDateTime(new Date(newComp.createdAt)),
      notes: newComp.notes
    }));
  };

  const submitSurveyResponse = (surveyId, answers) => {
    const responseId = `res-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    setSurveyResponses(prev => [...prev, {
      id: responseId,
      surveyId,
      tenantName: currentUser.name,
      answers,
      date
    }]);

    safePersist(persistCreate('survey_responses', {
      id: responseId,
      survey_id: surveyId,
      tenant_name: currentUser.name,
      date
    }));

    Object.entries(answers || {}).forEach(([questionId, answer], idx) => {
      safePersist(persistCreate('survey_answers', {
        id: `ans-${Date.now()}-${idx}`,
        response_id: responseId,
        question_id: questionId,
        answer: String(answer)
      }));
    });
  };

  const submitBtppRequest = (unitId, unitNumber) => {
    const requestId = `btp-${Date.now()}`;
    const submissionDate = new Date().toISOString().split('T')[0];

    setBtpp(prev => [...prev, {
      id: requestId,
      tenantName: currentUser.name,
      unitId,
      unitNumber,
      status: 'pending',
      submissionDate,
      handoverDate: null,
      notes: 'Berkas permohonan diserahkan oleh Penghuni.'
    }]);

    safePersist(persistCreate('btpp', {
      id: requestId,
      tenant_name: currentUser.name,
      unit_id: unitId,
      unit_number: unitNumber,
      status: 'pending',
      submission_date: submissionDate,
      handover_date: null,
      notes: 'Berkas permohonan diserahkan oleh Penghuni.'
    }));
  };

  const addAnggotaKeluarga = (payload) => {
    if (!currentUser?.id) return;

    const newMember = {
      id: `kel-${Date.now()}`,
      userId: currentUser.id,
      nik: payload.nik,
      namaLengkap: payload.namaLengkap,
      tanggalLahir: payload.tanggalLahir,
      jenisKelamin: payload.jenisKelamin
    };

    setAnggotaKeluarga((prev) => [newMember, ...prev]);

    safePersist(persistCreate('anggota_keluarga', {
      id: newMember.id,
      user_id: newMember.userId,
      nik: newMember.nik,
      nama_lengkap: newMember.namaLengkap,
      tanggal_lahir: newMember.tanggalLahir,
      jenis_kelamin: newMember.jenisKelamin
    }));
  };

  // --- EXECUTIVE / PIMPINAN DINAS OPERATIONS ---
  const approveBooking = (bookingId, approve = true) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (approve) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
      safePersist(persistUpdate('bookings', bookingId, { status: 'approved' }));
      changeUnitStatus(booking.unitId, 'occupied', booking.applicantName);
      assignUnitToUserFromBooking(booking);
      
      // Create first rent invoice
      const firstInvoiceId = `tag-${Date.now()}`;
      setTagihan(prev => [...prev, {
        id: firstInvoiceId,
        unitId: booking.unitId,
        unitNumber: booking.unitNumber,
        tenantName: booking.applicantName,
        type: 'Rent',
        amount: 450000,
        month: 'Juni 2026',
        status: 'unpaid',
        dueDate: '2026-07-10',
        paymentDate: null,
        proof: null
      }]);

      safePersist(persistCreate('tagihan', {
        id: firstInvoiceId,
        unit_id: booking.unitId,
        unit_number: booking.unitNumber,
        tenant_name: booking.applicantName,
        type: 'Rent',
        amount: 450000,
        month: 'Juni 2026',
        status: 'unpaid',
        due_date: '2026-07-10',
        payment_date: null,
        proof: null
      }));
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));
      safePersist(persistUpdate('bookings', bookingId, { status: 'rejected' }));
      changeUnitStatus(booking.unitId, 'available', '');
    }
  };

  const updateBtppStatus = (btppId, status, notes = '') => {
    setBtpp(prev => prev.map(b => {
      if (b.id === btppId) {
        return {
          ...b,
          status,
          notes,
          handoverDate: status === 'approved' ? new Date().toISOString().split('T')[0] : null
        };
      }
      return b;
    }));

    safePersist(persistUpdate('btpp', btppId, {
      status,
      notes,
      handover_date: status === 'approved' ? new Date().toISOString().split('T')[0] : null
    }));
  };

  const updateComplaintStatus = (complaintId, status, notes = '') => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return { ...c, status, notes };
      }
      return c;
    }));

    safePersist(persistUpdate('complaints', complaintId, {
      status,
      notes
    }));
  };

  const editBookingTransaction = (bookingId, fields) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...fields } : b));
    safePersist(persistUpdate('bookings', bookingId, {
      ...('applicantName' in fields ? { applicant_name: fields.applicantName } : {}),
      ...('nik' in fields ? { nik: fields.nik } : {}),
      ...('email' in fields ? { email: fields.email } : {}),
      ...('phone' in fields ? { phone: fields.phone } : {}),
      ...('rusunName' in fields ? { rusun_name: fields.rusunName } : {}),
      ...('unitNumber' in fields ? { unit_number: fields.unitNumber } : {}),
      ...('type' in fields ? { type: fields.type } : {}),
      ...('status' in fields ? { status: fields.status } : {})
    }));
  };

  const editTagihanTransaction = (tagihanId, fields) => {
    setTagihan(prev => prev.map(t => t.id === tagihanId ? { ...t, ...fields } : t));
    safePersist(persistUpdate('tagihan', tagihanId, {
      ...('tenantName' in fields ? { tenant_name: fields.tenantName } : {}),
      ...('unitNumber' in fields ? { unit_number: fields.unitNumber } : {}),
      ...('type' in fields ? { type: fields.type } : {}),
      ...('amount' in fields ? { amount: fields.amount } : {}),
      ...('month' in fields ? { month: fields.month } : {}),
      ...('status' in fields ? { status: fields.status } : {}),
      ...('dueDate' in fields ? { due_date: fields.dueDate } : {}),
      ...('paymentDate' in fields ? { payment_date: fields.paymentDate } : {}),
      ...('proof' in fields ? { proof: fields.proof } : {})
    }));
  };

  const editContractTransaction = (contractId, fields) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, ...fields } : c));
    safePersist(persistUpdate('contracts', contractId, {
      ...('vendorName' in fields ? { vendor_name: fields.vendorName } : {}),
      ...('workType' in fields ? { work_type: fields.workType } : {}),
      ...('startDate' in fields ? { start_date: fields.startDate } : {}),
      ...('endDate' in fields ? { end_date: fields.endDate } : {}),
      ...('budget' in fields ? { budget: fields.budget } : {}),
      ...('status' in fields ? { status: fields.status } : {})
    }));
  };

  const editInspectionTransaction = (inspectionId, fields) => {
    setInspections(prev => prev.map(i => i.id === inspectionId ? { ...i, ...fields } : i));
    safePersist(persistUpdate('inspections', inspectionId, fields));
  };

  const editBtppTransaction = (btppId, fields) => {
    setBtpp(prev => prev.map(b => b.id === btppId ? { ...b, ...fields } : b));
    safePersist(persistUpdate('btpp', btppId, {
      ...('tenantName' in fields ? { tenant_name: fields.tenantName } : {}),
      ...('unitNumber' in fields ? { unit_number: fields.unitNumber } : {}),
      ...('status' in fields ? { status: fields.status } : {}),
      ...('submissionDate' in fields ? { submission_date: fields.submissionDate } : {}),
      ...('handoverDate' in fields ? { handover_date: fields.handoverDate } : {}),
      ...('notes' in fields ? { notes: fields.notes } : {})
    }));
  };

  const updateMyProfile = (fields) => {
    if (!currentUser?.id) return;

    const allowed = {
      ...('name' in fields ? { name: fields.name } : {}),
      ...('email' in fields ? { email: fields.email } : {}),
      ...('phone' in fields ? { phone: fields.phone } : {}),
      ...('password' in fields && fields.password ? { password: fields.password } : {})
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...allowed } : u));
    setCurrentUser(prev => prev ? { ...prev, ...allowed } : prev);

    safePersist(persistUpdate('users', currentUser.id, {
      ...('name' in allowed ? { name: allowed.name } : {}),
      ...('email' in allowed ? { email: allowed.email } : {}),
      ...('phone' in allowed ? { phone: allowed.phone } : {}),
      ...('password' in allowed ? { password: allowed.password } : {})
    }));
  };

  return (
    <DbContext.Provider value={{
      users,
      rusun,
      bookings,
      tagihan,
      complaints,
      contracts,
      inspections,
      btpp,
      surveys,
      surveyResponses,
      metadata,
      anggotaKeluarga,
      activityLogs,
      currentUser,
      changeRole,
      setCurrentUserById,
      logoutUser,
      authenticateUser,
      registerResident,
      
      // Admin methods
      addUser,
      updateUser,
      deleteUser,
      addMetadataItem,
      deleteMetadataItem,
      addQuestionnaire,
      toggleSurveyActive,

      // Entry methods
      addRusun,
      addTower,
      updateTower,
      deleteTower,
      addUnit,
      changeUnitStatus,

      // UPRS methods
      addContract,
      addInspection,
      updateInspectionStatus,
      drawLotteryAndAssign,

      // Penghuni methods
      addBooking,
      payBill,
      addComplaint,
      submitSurveyResponse,
      submitBtppRequest,
      addAnggotaKeluarga,

      // Pimpinan methods
      approveBooking,
      updateBtppStatus,
      updateComplaintStatus,

      // Shared edit methods
      editBookingTransaction,
      editTagihanTransaction,
      editContractTransaction,
      editInspectionTransaction,
      editBtppTransaction,
      updateMyProfile
    }}>
      {children}
    </DbContext.Provider>
  );
};
