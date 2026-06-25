import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import Pagination from '../components/Pagination';
import { 
  Home, FileText, Send, CheckCircle, AlertTriangle, 
  DollarSign, HelpCircle, ArrowUpRight, Upload, Info
} from 'lucide-react';

const DENAH_PAGE_SIZE = 8;

export default function PenghuniRusun({ activeMenu, setActiveMenu }) {
  const { 
    currentUser, rusun, tagihan, payBill,
    complaints, addComplaint,
    surveys, submitSurveyResponse,
    btpp, submitBtppRequest,
    bookings, addBooking,
    anggotaKeluarga, addAnggotaKeluarga
  } = useDb();

  const [bookingForm, setBookingForm] = useState({ nik: '', phone: '', rusunId: '', towerId: '', unitId: '' });
  const [bookingTowerSearch, setBookingTowerSearch] = useState('');
  const [bookingTowerSearchOpen, setBookingTowerSearchOpen] = useState(false);
  const [denahPage, setDenahPage] = useState(1);
  const [keluargaForm, setKeluargaForm] = useState({ nik: '', namaLengkap: '', tanggalLahir: '', jenisKelamin: 'Laki-laki' });
  const [complaintForm, setComplaintForm] = useState({ category: 'Fasilitas Air', description: '' });
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [btppSubmitted, setBtppSubmitted] = useState(false);

  const myKeluarga = anggotaKeluarga.filter((item) => item.userId === currentUser?.id);

  const unitRows = rusun.flatMap((r) =>
    r.towers.flatMap((t) =>
      t.units.map((u) => ({
        ...u,
        rusunId: r.id,
        rusunName: r.name,
        towerId: t.id,
        towerName: t.name,
      }))
    )
  );

  const approvedMyBookings = bookings
    .filter((b) =>
      b.status === 'approved' &&
      (b.applicantName === currentUser.name || b.email === currentUser.email)
    )
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const activeBooking = approvedMyBookings[0] || null;
  const assignedUnitId = currentUser.unitId || activeBooking?.unitId || null;
  const assignedUnit = unitRows.find((u) => u.id === assignedUnitId) || null;
  const assignedUnitNumber = assignedUnit?.number || activeBooking?.unitNumber || '-';
  const assignedRusunName = assignedUnit?.rusunName || activeBooking?.rusunName || 'Belum ada hunian aktif';
  const assignedTowerName = assignedUnit?.towerName || '-';
  const assignedUnitPrice = assignedUnit?.price || 0;

  // Filter tagihan for current user
  const myBills = tagihan.filter(t => t.tenantName === currentUser.name);

  // Filter complaints for current user
  const myComplaints = complaints.filter(c => c.senderName === currentUser.name);

  // Filter BTPP for current user
  const myBtpp = btpp.filter(b => b.tenantName === currentUser.name);

  // Get units list for booking dropdown
  const getAvailableUnits = () => {
    const list = [];
    rusun.forEach(r => {
      r.towers.forEach(t => {
        t.units.forEach(u => {
          if (u.status === 'available') {
            list.push({ ...u, rusunId: r.id, rusunName: r.name, towerId: t.id, towerName: t.name });
          }
        });
      });
    });
    return list;
  };

  const availableUnits = getAvailableUnits();

  const rusunWithAvailableUnits = rusun
    .map((item) => ({
      id: item.id,
      name: item.name,
      hasAvailable: item.towers.some((tower) => tower.units.some((unit) => unit.status === 'available'))
    }))
    .filter((item) => item.hasAvailable);

  const selectedRusun = rusun.find((item) => item.id === bookingForm.rusunId) || null;
  const selectedTowers = selectedRusun?.towers || [];
  const selectedTower = selectedTowers.find((item) => item.id === bookingForm.towerId) || null;
  const selectedTowerUnits = selectedTower?.units || [];
  const selectedTowerAvailableUnits = selectedTowerUnits.filter((unit) => unit.status === 'available');
  const towerSearchRows = selectedTowers
    .map((item) => ({
      id: item.id,
      name: item.name,
      floorCount: Number(item.floorCount ?? item.floor_count ?? 1) || 1,
    }))
    .filter((item) => item.name);
  const filteredTowerSearchRows = towerSearchRows.filter((item) => {
    const query = bookingTowerSearch.trim().toLowerCase();
    if (!query) return true;
    const bag = `${item.name} ${item.floorCount} ${item.floorCount} lantai`.toLowerCase();
    return bag.includes(query);
  });
  const totalDenahPages = Math.max(1, Math.ceil(selectedTowerUnits.length / DENAH_PAGE_SIZE));
  const safeDenahPage = Math.min(denahPage, totalDenahPages);
  const pagedTowerUnits = selectedTowerUnits.slice((safeDenahPage - 1) * DENAH_PAGE_SIZE, safeDenahPage * DENAH_PAGE_SIZE);
  const denahStartIndex = selectedTowerUnits.length === 0 ? 0 : (safeDenahPage - 1) * DENAH_PAGE_SIZE + 1;
  const denahEndIndex = selectedTowerUnits.length === 0 ? 0 : Math.min(safeDenahPage * DENAH_PAGE_SIZE, selectedTowerUnits.length);
  const denahStatusSummary = selectedTowerUnits.reduce((acc, unit) => {
    if (unit.status === 'available') acc.available += 1;
    else if (unit.status === 'booked') acc.booked += 1;
    else if (unit.status === 'maintenance') acc.maintenance += 1;
    else acc.occupied += 1;
    return acc;
  }, { available: 0, occupied: 0, booked: 0, maintenance: 0 });

  const getUnitStatusStyle = (status) => {
    if (status === 'available') {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
    }
    if (status === 'booked') {
      return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
    }
    if (status === 'maintenance') {
      return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400';
    }
    return 'bg-slate-200/70 dark:bg-slate-800 border-slate-300/80 dark:border-slate-700 text-slate-500 dark:text-slate-400';
  };

  const getUnitStatusLabel = (status) => {
    if (status === 'available') return 'Kosong';
    if (status === 'booked') return 'Dipesan';
    if (status === 'maintenance') return 'Perawatan';
    return 'Terisi';
  };

  // Booking submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.nik || !bookingForm.phone || !bookingForm.unitId) return;
    
    const matchedUnit = availableUnits.find(u => u.id === bookingForm.unitId);
    if (!matchedUnit) return;

    addBooking({
      applicantName: currentUser.name,
      nik: bookingForm.nik,
      email: currentUser.email,
      phone: bookingForm.phone,
      rusunId: matchedUnit.rusunId,
      rusunName: matchedUnit.rusunName,
      towerId: matchedUnit.towerId,
      unitId: matchedUnit.id,
      unitNumber: matchedUnit.number,
      type: matchedUnit.rusunName.includes('Klapa') ? 'Rusunami Umum' : 'Rusunawa Umum'
    });

    setBookingForm({ nik: '', phone: '', rusunId: '', towerId: '', unitId: '' });
    setBookingTowerSearch('');
    setBookingTowerSearchOpen(false);
    setDenahPage(1);
    alert('Pendaftaran berhasil diajukan! Menunggu persetujuan UPRS.');
    if (typeof setActiveMenu === 'function') {
      setActiveMenu('dashboard');
    }
  };

  const handleKeluargaSubmit = (e) => {
    e.preventDefault();
    if (!keluargaForm.nik || !keluargaForm.namaLengkap || !keluargaForm.tanggalLahir || !keluargaForm.jenisKelamin) return;

    addAnggotaKeluarga(keluargaForm);
    setKeluargaForm({ nik: '', namaLengkap: '', tanggalLahir: '', jenisKelamin: 'Laki-laki' });
  };

  // Complaint submit
  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintForm.description) return;
    addComplaint(complaintForm.category, complaintForm.description);
    setComplaintForm({ category: 'Fasilitas Air', description: '' });
  };

  // Pay bill simulator
  const handlePayment = (id) => {
    payBill(id, 'receipt_upload.jpg');
    alert('Bukti transfer pembayaran berhasil diupload! Pembayaran dikonfirmasi.');
  };

  // BTPP submission
  const handleBtppSubmit = () => {
    if (!assignedUnitId) {
      alert('Unit hunian Anda belum aktif. BTPP hanya bisa diajukan setelah unit disetujui.');
      return;
    }

    submitBtppRequest(assignedUnitId, assignedUnitNumber);
    setBtppSubmitted(true);
    alert('Permohonan serah terima BTPP berhasil dikirim!');
  };

  // Survey answers submit
  const handleSurveySubmit = (e, surveyId) => {
    e.preventDefault();
    submitSurveyResponse(surveyId, surveyAnswers);
    setSurveyAnswers({});
    alert('Terima kasih! Kuesioner Anda berhasil disimpan.');
  };

  // --- MY HOUSING UNIT VIEW ---
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-l-4 border-orange-500 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Home className="w-5 h-5 text-orange-500" />
              <span>Detail Hunian Saya</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lokasi Rumah Susun</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{assignedRusunName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nomor Unit Kamar</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{assignedTowerName} - Kamar {assignedUnitNumber}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Sewa Kontrak</span>
                {assignedUnitId ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[9px]">
                    Aktif / Berlaku
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-[9px]">
                    Menunggu Persetujuan
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Harga Sewa Bulanan</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {assignedUnitPrice > 0 ? `Rp ${assignedUnitPrice.toLocaleString('id-ID')} / Bulan` : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-orange-500 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Tata Tertib Hunian
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Membayar sewa sebelum tanggal 10 setiap bulannya.</li>
              <li>Menjaga ketertiban & kebersihan lingkungan.</li>
              <li>Dilarang merusak instalasi pipa/listrik.</li>
              <li>Melaporkan tamu menginap 1x24 jam ke UPRS.</li>
            </ul>
          </div>
        </div>

        {/* Occupant list */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
            Daftar Anggota Keluarga Terdaftar
          </h3>
          <form onSubmit={handleKeluargaSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              value={keluargaForm.nik}
              onChange={(e) => setKeluargaForm({ ...keluargaForm, nik: e.target.value })}
              placeholder="NIK"
              className="glass-input text-xs"
            />
            <input
              type="text"
              value={keluargaForm.namaLengkap}
              onChange={(e) => setKeluargaForm({ ...keluargaForm, namaLengkap: e.target.value })}
              placeholder="Nama Lengkap"
              className="glass-input text-xs"
            />
            <input
              type="date"
              value={keluargaForm.tanggalLahir}
              onChange={(e) => setKeluargaForm({ ...keluargaForm, tanggalLahir: e.target.value })}
              className="glass-input text-xs"
            />
            <select
              value={keluargaForm.jenisKelamin}
              onChange={(e) => setKeluargaForm({ ...keluargaForm, jenisKelamin: e.target.value })}
              className="glass-input text-xs bg-white dark:bg-slate-900"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700 text-xs py-2">
              Simpan
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3 font-semibold">NIK</th>
                  <th className="py-2 px-3 font-semibold">Nama Lengkap</th>
                  <th className="py-2 px-3 font-semibold">Tanggal Lahir</th>
                  <th className="py-2 px-3 font-semibold">Jenis Kelamin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {myKeluarga.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">{item.nik}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{item.namaLengkap}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.tanggalLahir}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.jenisKelamin}</td>
                  </tr>
                ))}
                {myKeluarga.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-3 text-center text-slate-400 italic">Belum ada data anggota keluarga.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
      </div>
    );
  }

  // --- APPLY FOR NEW HOUSING ---
  if (activeMenu === 'apply_booking') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Booking Form */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Formulir Pendaftaran Rusun
          </h3>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pemohon</label>
              <input type="text" value={currentUser.name} disabled className="glass-input text-xs bg-slate-100 dark:bg-slate-800 opacity-60" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor NIK Penduduk</label>
              <input 
                type="text" 
                value={bookingForm.nik}
                onChange={e => setBookingForm({...bookingForm, nik: e.target.value})}
                placeholder="3174xxxxxxxxxxxx" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">No. Telepon / WA</label>
              <input 
                type="text" 
                value={bookingForm.phone}
                onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                placeholder="08xxxxxxxxxx" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Lokasi Rusun</label>
              <select
                value={bookingForm.rusunId}
                onChange={(e) => {
                  const nextRusun = rusun.find((item) => item.id === e.target.value);
                  const firstTower = nextRusun?.towers?.[0];
                  setBookingForm({
                    ...bookingForm,
                    rusunId: e.target.value,
                    towerId: firstTower?.id || '',
                    unitId: ''
                  });
                  setBookingTowerSearch('');
                  setBookingTowerSearchOpen(false);
                  setDenahPage(1);
                }}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- Pilih Rumah Susun --</option>
                {rusunWithAvailableUnits.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Blok / Tower</label>
              <div className="relative">
                <input
                  type="text"
                  value={bookingTowerSearch}
                  onChange={(e) => {
                    setBookingTowerSearch(e.target.value);
                    setBookingTowerSearchOpen(true);
                  }}
                  onFocus={() => setBookingTowerSearchOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setBookingTowerSearchOpen(false), 120);
                  }}
                  placeholder="Cari nama blok / tower..."
                  disabled={!bookingForm.rusunId}
                  className="glass-input text-xs w-full bg-white dark:bg-slate-900 disabled:opacity-60"
                />

                {bookingForm.rusunId && bookingTowerSearchOpen && filteredTowerSearchRows.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-md">
                    {filteredTowerSearchRows.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setBookingForm({ ...bookingForm, towerId: item.id, unitId: '' });
                          setBookingTowerSearch(`${item.name} · Lantai ${item.floorCount}`);
                          setBookingTowerSearchOpen(false);
                          setDenahPage(1);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-500/10 transition flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Lantai tersedia: {item.floorCount}</div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full">Lantai {item.floorCount}</span>
                      </button>
                    ))}
                  </div>
                )}

                {bookingForm.rusunId && bookingTowerSearchOpen && bookingTowerSearch.trim() && filteredTowerSearchRows.length === 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl px-4 py-3 text-xs text-slate-400">
                    Tower tidak ditemukan untuk rusun yang dipilih.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Unit Rusun Tersedia</label>
              <select 
                value={bookingForm.unitId}
                onChange={e => setBookingForm({...bookingForm, unitId: e.target.value})}
                disabled={!bookingForm.towerId}
                className="glass-input text-xs bg-white dark:bg-slate-900 disabled:opacity-60"
              >
                <option value="">-- Pilih Kamar --</option>
                {selectedTowerAvailableUnits.map((u) => (
                  <option key={u.id} value={u.id}>Kamar {u.number} - Lantai {u.floor}</option>
                ))}
              </select>
            </div>
            
            <div className="border border-dashed border-orange-500/30 bg-orange-500/5 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-orange-400 uppercase block">Simulasi Dokumen Persyaratan</span>
              <div className="flex gap-2">
                <button type="button" className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-bold rounded">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload KTP & KK</span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-xs py-2.5">
              <Send className="w-4 h-4" />
              <span>Kirim Permohonan</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Denah Unit Berdasarkan Blok / Tower
                </h3>
                <p className="text-xs text-slate-400 mt-1">Pilih unit langsung dari denah. Unit yang bisa dipilih hanya berstatus kosong.</p>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tap / Klik Unit</div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
              <span className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Kosong</span>
              <span className="px-2.5 py-1 rounded-full border border-slate-300/80 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Terisi</span>
              <span className="px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">Dipesan</span>
              <span className="px-2.5 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">Perawatan</span>
            </div>

            {!bookingForm.rusunId || !bookingForm.towerId ? (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center text-xs text-slate-400">
                Pilih rumah susun dan blok terlebih dahulu untuk menampilkan denah unit.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Menampilkan denah <span className="font-bold text-slate-700 dark:text-slate-200">{selectedRusun?.name}</span> - <span className="font-bold text-slate-700 dark:text-slate-200">{selectedTower?.name}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">Kosong: {denahStatusSummary.available}</div>
                  <div className="rounded-xl border border-slate-300/80 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800 px-3 py-2 text-slate-600 dark:text-slate-300 font-semibold">Terisi: {denahStatusSummary.occupied}</div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-600 dark:text-amber-400 font-semibold">Dipesan: {denahStatusSummary.booked}</div>
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-400 font-semibold">Perawatan: {denahStatusSummary.maintenance}</div>
                </div>

                {selectedTowerUnits.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    Menampilkan unit {denahStartIndex}-{denahEndIndex} dari {selectedTowerUnits.length} unit.
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {pagedTowerUnits.map((unit) => {
                    const isAvailable = unit.status === 'available';
                    const isSelected = bookingForm.unitId === unit.id;

                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          if (!isAvailable) return;
                          setBookingForm({
                            ...bookingForm,
                            unitId: unit.id
                          });
                        }}
                        className={`rounded-2xl border p-3 text-left transition-all ${getUnitStatusStyle(unit.status)} ${
                          isAvailable ? 'hover:scale-[1.02] hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-80'
                        } ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">{unit.number}</span>
                          <span className="text-[10px] font-bold uppercase">{getUnitStatusLabel(unit.status)}</span>
                        </div>
                        <div className="text-[11px] mt-1">Lantai {unit.floor}</div>
                        <div className="text-[11px] font-semibold mt-1">Rp {unit.price.toLocaleString('id-ID')}</div>
                      </button>
                    );
                  })}
                </div>

                {selectedTowerUnits.length === 0 && (
                  <div className="text-xs text-slate-400 italic">Belum ada unit terdaftar pada blok ini.</div>
                )}

                {selectedTowerUnits.length > 0 && (
                  <Pagination page={safeDenahPage} totalPages={totalDenahPages} onPageChange={setDenahPage} />
                )}

                {selectedTowerUnits.length > 0 && selectedTowerAvailableUnits.length === 0 && (
                  <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                    Seluruh unit pada blok ini sedang tidak tersedia. Silakan pilih blok lain.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Alur & Prosedur Pendaftaran
            </h3>
            <div className="space-y-4 text-xs leading-relaxed text-slate-400">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Pilih Blok, Cek Denah, Lalu Pilih Unit</p>
                  <p className="mt-0.5">Pilih unit berstatus kosong pada denah, kemudian lengkapi upload berkas KTP, Kartu Keluarga, dan SKTM.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Verifikasi UPRS</p>
                  <p className="mt-0.5">Petugas UPRS Perawatan memeriksa kecocokan administrasi dan validitas SKTM.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Lotere & Pengundian Unit</p>
                  <p className="mt-0.5">Jika disetujui, UPRS menetapkan penempatan undian unit dan menerbitkan tagihan pertama sewa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BILLS AND PAYMENTS ---
  if (activeMenu === 'my_bills') {
    return (
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Riwayat Tagihan & Pembayaran Sewa
          </h3>
          <p className="text-xs text-slate-400 mt-1">Pembayaran tagihan uang sewa bulanan dan pemakaian utilitas air / listrik.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Jenis Tagihan</th>
                <th className="py-2.5 px-3 font-semibold">Periode Bulan</th>
                <th className="py-2.5 px-3 font-semibold">Jumlah Tagihan</th>
                <th className="py-2.5 px-3 font-semibold">Jatuh Tempo</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal Bayar</th>
                <th className="py-2.5 px-3 font-semibold text-right">Aksi / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {myBills.map((t) => (
                <tr key={t.id} className="hover:bg-orange-500/5">
                  <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100">{t.type}</td>
                  <td className="py-3.5 px-3 text-slate-400">{t.month}</td>
                  <td className="py-3.5 px-3 font-bold text-orange-500">Rp {t.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-3 text-slate-400 font-semibold">{t.dueDate}</td>
                  <td className="py-3.5 px-3 text-slate-400">{t.paymentDate || '-'}</td>
                  <td className="py-3.5 px-3 text-right">
                    {t.status === 'unpaid' ? (
                      <button 
                        onClick={() => handlePayment(t.id)}
                        className="px-3 py-1 bg-orange-500 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider hover:bg-orange-600 transition shadow-md active:scale-95"
                      >
                        Bayar Sekarang
                      </button>
                    ) : (
                      <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        LUNAS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {myBills.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-4 text-center italic text-slate-400">Tidak ada data tagihan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- SUBMIT COMPLAINT FORM ---
  if (activeMenu === 'submit_complaint') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Complaint */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Laporkan Kerusakan / Aduan
          </h3>
          <form onSubmit={handleComplaintSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori Kerusakan</label>
              <select 
                value={complaintForm.category}
                onChange={e => setComplaintForm({...complaintForm, category: e.target.value})}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="Fasilitas Air">Instalasi Pipa / Air Bersih</option>
                <option value="Kelistrikan">MEP / Kelistrikan</option>
                <option value="Struktur Bangunan">Struktur (Atap Bocor, Retak)</option>
                <option value="Sosial & Ketertiban">Keamanan & Ketertiban Warga</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Laporan</label>
              <textarea 
                value={complaintForm.description}
                onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                placeholder="Jelaskan detail keluhan..." 
                className="glass-input text-xs min-h-[100px]" 
              />
            </div>
            
            <div className="border border-dashed border-orange-500/30 bg-orange-500/5 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-orange-400 uppercase block">Bukti Foto Kerusakan</span>
              <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-bold rounded-lg hover:bg-orange-500/20 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Foto</span>
              </button>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-xs py-2.5">
              <Send className="w-4 h-4" />
              <span>Kirim Laporan</span>
            </button>
          </form>
        </div>

        {/* Complaint History */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Riwayat Laporan Aduan Saya
          </h3>
          <div className="space-y-4">
            {myComplaints.map((c) => (
              <div key={c.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{c.category}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{c.description}</p>
                  {c.notes && (
                    <div className="bg-slate-500/5 border border-white/5 p-2 rounded-lg text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">Catatan Petugas: </span>
                      {c.notes}
                    </div>
                  )}
                </div>

                <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[9px] uppercase tracking-wider ${
                  c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  c.status === 'processing' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 animate-pulse' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
            {myComplaints.length === 0 && (
              <div className="text-center py-6 text-slate-400 italic text-xs">Belum ada laporan kerusakan yang dikirim.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- SUBMIT BTPP REQUEST ---
  if (activeMenu === 'btpp_request') {
    return (
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Info className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Pengajuan BTPP (Buku Tanda Pemilikan Perumahan)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Sertifikat tanda kepemilikan rusunami diberikan bagi warga yang telah melunasi cicilan/syarat kontrak.</p>
          </div>
        </div>

        {myBtpp.length === 0 && !btppSubmitted ? (
          <div className="border border-dashed border-orange-500/30 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto">
            <h4 className="font-bold text-xs">Apakah Anda ingin mengajukan serah terima BTPP sekarang?</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Pastikan Anda sudah menyiapkan seluruh fotokopi tanda bukti cicilan dan pelunasan berkas administrasi.
            </p>
            <button 
              onClick={handleBtppSubmit}
              className="btn-primary bg-orange-500 hover:bg-orange-600 text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <span>Ajukan BTPP</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Permohonan BTPP</span>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-bold text-[9px] uppercase tracking-wider">
                Diproses Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Berkas Anda telah diterima oleh Admin Dinas. Petugas sedang menjadwalkan pencetakan dan waktu penyerahan kunci unit.
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- FILL SURVEYS ---
  if (activeMenu === 'fill_survey') {
    const activeSurveys = surveys.filter(s => s.active);

    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Survei Kepuasan Warga Rusun
          </h3>
          <p className="text-xs text-slate-400 mt-1">Bantu kami meningkatkan kualitas layanan pengelola dengan mengisi angket berikut.</p>
        </div>

        {activeSurveys.map((s) => (
          <form key={s.id} onSubmit={(e) => handleSurveySubmit(e, s.id)} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 max-w-xl">
            <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{s.title}</h4>
              <p className="text-xs text-slate-400">{s.description}</p>
            </div>

            {s.questions.map((q) => (
              <div key={q.id} className="space-y-2 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">{q.text}</label>
                
                {q.type === 'scale' ? (
                  <div className="flex gap-4 items-center">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name={q.id} 
                          value={val}
                          onChange={() => setSurveyAnswers({...surveyAnswers, [q.id]: val})}
                          className="text-orange-500 focus:ring-orange-500" 
                        />
                        <span className="font-semibold text-slate-400">{val}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    placeholder="Tuliskan masukan Anda..."
                    onChange={(e) => setSurveyAnswers({...surveyAnswers, [q.id]: e.target.value})}
                    className="glass-input text-xs w-full" 
                  />
                )}
              </div>
            ))}

            <button type="submit" className="btn-primary bg-orange-500 hover:bg-orange-600 text-xs py-2 px-5">
              Kirim Jawaban
            </button>
          </form>
        ))}
        {activeSurveys.length === 0 && (
          <div className="text-center py-6 text-slate-400 italic text-xs">Saat ini tidak ada kuesioner aktif yang perlu diisi.</div>
        )}
      </div>
    );
  }

  return null;
}

