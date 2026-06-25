import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { 
  Plus, Home, Tag, Calendar, FileText, CheckCircle, 
  AlertTriangle, DollarSign, Upload, UserPlus, Heart, Edit2, Trash2
} from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 5;

const paginateItems = (items, page) => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

export default function AdminDinas({ activeMenu }) {
  const { 
    rusun, addRusun, addTower, updateTower, deleteTower, addUnit,
    bookings, approveBooking,
    tagihan, btpp, surveyResponses, surveys,
    editBookingTransaction, editBtppTransaction, editTagihanTransaction
  } = useDb();

  const [rusunForm, setRusunForm] = useState({ name: '', type: 'Rusunawa (Sewa)', address: '' });
  const [towerForm, setTowerForm] = useState({ rusunId: '', name: '', floorCount: '', nameMode: 'search' });
  const [towerSearch, setTowerSearch] = useState('');
  const [towerSearchOpen, setTowerSearchOpen] = useState(false);
  const [unitTowerSearch, setUnitTowerSearch] = useState('');
  const [unitTowerSearchOpen, setUnitTowerSearchOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({ rusunId: '', towerId: '', number: '', floor: '', price: '' });
  const [bookingsPage, setBookingsPage] = useState(1);
  const [btppPage, setBtppPage] = useState(1);
  const [billingPage, setBillingPage] = useState(1);
  const [towerListPage, setTowerListPage] = useState(1);
  const [unitListPage, setUnitListPage] = useState(1);
  const [towerFilterInput, setTowerFilterInput] = useState('');
  const [towerFilterKeyword, setTowerFilterKeyword] = useState('');
  const [unitFilterInput, setUnitFilterInput] = useState('');
  const [unitFilterKeyword, setUnitFilterKeyword] = useState('');

  const getTowerCode = (towerName = '') => {
    const segments = towerName.trim().split(/\s+/).filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    const code = lastSegment.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase();
    return code || 'U';
  };

  const getNextUnitNumber = (tower, floor) => {
    if (!tower) return '';
    const floorValue = String(floor || '1').trim();
    const towerCode = getTowerCode(tower.name);
    const matchingUnits = (tower.units || []).filter((unit) => String(unit.floor).trim() === floorValue);

    const nextSequence = matchingUnits.reduce((highest, unit) => {
      const suffix = String(unit.number || '').split('-').pop() || '';
      const parsedSequence = Number.parseInt(suffix.slice(-2), 10);
      return Number.isFinite(parsedSequence) && parsedSequence > highest ? parsedSequence : highest;
    }, 0) + 1;

    return `${towerCode}-${floorValue}${String(nextSequence).padStart(2, '0')}`;
  };

  // Handle forms
  const handleRusunSubmit = (e) => {
    e.preventDefault();
    if (!rusunForm.name || !rusunForm.address) return;
    addRusun(rusunForm.name, rusunForm.type, rusunForm.address);
    setRusunForm({ name: '', type: 'Rusunawa (Sewa)', address: '' });
  };

  const handleTowerSubmit = (e) => {
    e.preventDefault();
    if (!towerForm.rusunId || !towerForm.name || !towerForm.floorCount) return;
    addTower(towerForm.rusunId, towerForm.name, towerForm.floorCount);
    setTowerForm({ rusunId: '', name: '', floorCount: '', nameMode: 'search' });
    setTowerSearch('');
    setTowerSearchOpen(false);
  };

  const handleEditTower = (tower, rusunId) => {
    const nextName = window.prompt('Ubah nama blok / tower:', tower.name || '');
    if (nextName === null) return;

    const nextFloorCount = window.prompt('Ubah data lantai tersedia:', String(tower.floorCount || tower.floor_count || 1));
    if (nextFloorCount === null) return;

    updateTower(tower.id, {
      rusunId,
      name: nextName.trim() || tower.name,
      floorCount: nextFloorCount.trim() || tower.floorCount || tower.floor_count || 1
    });
  };

  const handleDeleteTower = (tower, rusunName) => {
    const confirmed = window.confirm(`Hapus tower ${tower.name} dari ${rusunName}? Tindakan ini juga menghapus semua unit di dalamnya.`);
    if (!confirmed) return;
    deleteTower(tower.id);
  };

  const handleUnitSubmit = (e) => {
    e.preventDefault();
    if (!unitForm.rusunId || !unitForm.towerId || !unitForm.number || !unitForm.floor || !unitForm.price) return;
    addUnit(unitForm.rusunId, unitForm.towerId, unitForm.number, unitForm.floor, unitForm.price);
    setUnitForm({ rusunId: '', towerId: '', number: '', floor: '', price: '' });
    setUnitTowerSearch('');
    setUnitTowerSearchOpen(false);
  };

  const handleEditBooking = (booking) => {
    const phone = window.prompt('Ubah nomor telepon pemohon:', booking.phone || '');
    if (phone === null) return;
    const unitNumber = window.prompt('Ubah nomor unit:', booking.unitNumber || '');
    if (unitNumber === null) return;
    editBookingTransaction(booking.id, {
      phone: phone.trim() || booking.phone,
      unitNumber: unitNumber.trim() || booking.unitNumber
    });
  };

  const handleEditBtpp = (item) => {
    const notes = window.prompt('Ubah keterangan BTPP:', item.notes || '');
    if (notes === null) return;
    editBtppTransaction(item.id, { notes });
  };

  const handleEditTagihan = (item) => {
    const amount = window.prompt('Ubah jumlah tagihan:', String(item.amount));
    if (amount === null) return;
    const status = window.prompt('Ubah status tagihan (unpaid/paid/overdue):', item.status || 'unpaid');
    if (status === null) return;
    const parsedAmount = Number(amount);
    editTagihanTransaction(item.id, {
      amount: Number.isFinite(parsedAmount) ? parsedAmount : item.amount,
      status: status.trim() || item.status
    });
  };

  // Helper count units
  const countUnits = (status = null) => {
    let count = 0;
    rusun.forEach(r => {
      r.towers.forEach(t => {
        t.units.forEach(u => {
          if (!status || u.status === status) count++;
        });
      });
    });
    return count;
  };

  const selectedRusunForUnit = rusun.find((item) => item.id === unitForm.rusunId);
  const towersList = selectedRusunForUnit ? selectedRusunForUnit.towers : [];
  const unitTowerSuggestions = towersList
    .map((item) => ({
      id: item.id,
      name: item.name,
      floorCount: Number(item.floorCount ?? item.floor_count ?? 1) || 1,
    }))
    .filter((item) => item.name);
  const filteredUnitTowerSuggestions = unitTowerSuggestions.filter((item) => {
    const query = unitTowerSearch.trim().toLowerCase();
    if (!query) return true;
    const searchableValue = `${item.name} ${item.floorCount} ${item.floorCount} lantai`.toLowerCase();
    return searchableValue.includes(query);
  });
  const selectedTowerForUnit = towersList.find((item) => item.id === unitForm.towerId) || null;
  const towerFloorTotal = Number(selectedTowerForUnit?.floorCount ?? selectedTowerForUnit?.floor_count ?? 1) || 1;
  const availableFloors = Array.from({ length: towerFloorTotal }, (_, idx) => String(idx + 1));
  const autoUnitNumber = selectedTowerForUnit ? getNextUnitNumber(selectedTowerForUnit, unitForm.floor || availableFloors[0] || '1') : '';
  const selectedRusunForTower = rusun.find((item) => item.id === towerForm.rusunId) || null;
  const towerNameSuggestions = (selectedRusunForTower?.towers || [])
    .map((item) => ({
      id: item.id,
      name: item.name,
      floorCount: Number(item.floorCount ?? item.floor_count ?? 1) || 1,
    }))
    .filter((item) => item.name);
  const filteredTowerSuggestions = towerNameSuggestions.filter((item) => {
    const query = towerSearch.trim().toLowerCase();
    if (!query) return true;
    const searchableValue = `${item.name} ${item.floorCount} ${item.floorCount} lantai`.toLowerCase();
    return searchableValue.includes(query);
  });

  const towerRows = rusun.flatMap((r) =>
    r.towers.map((t) => ({
      ...t,
      rusunId: r.id,
      rusunName: r.name,
      floorCount: Number(t.floorCount ?? t.floor_count ?? 1) || 1,
      unitTotal: t.units.length,
    }))
  );

  const filteredTowerRows = towerRows.filter((row) => {
    const q = towerFilterKeyword.trim().toLowerCase();
    if (!q) return true;
    const bag = `${row.name} ${row.rusunName} ${row.floorCount}`.toLowerCase();
    return bag.includes(q);
  });
  const totalTowerPages = Math.max(1, Math.ceil(filteredTowerRows.length / PAGE_SIZE));
  const safeTowerPage = Math.min(towerListPage, totalTowerPages);
  const pagedTowerRows = paginateItems(filteredTowerRows, safeTowerPage);

  const unitRows = rusun.flatMap((r) =>
    r.towers.flatMap((t) =>
      t.units.map((u) => ({
        ...u,
        towerName: t.name,
        rusunName: r.name,
      }))
    )
  );

  const filteredUnitRows = unitRows.filter((row) => {
    const q = unitFilterKeyword.trim().toLowerCase();
    if (!q) return true;
    const bag = `${row.number} ${row.towerName} ${row.rusunName} ${row.floor} ${row.status}`.toLowerCase();
    return bag.includes(q);
  });
  const totalUnitPages = Math.max(1, Math.ceil(filteredUnitRows.length / PAGE_SIZE));
  const safeUnitPage = Math.min(unitListPage, totalUnitPages);
  const pagedUnitRows = paginateItems(filteredUnitRows, safeUnitPage);

  // --- STATS OVERVIEW ---
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-orange-500">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Rusun Terdaftar</span>
              <h3 className="text-2xl font-bold mt-1">{rusun.length} lokasi</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-amber-500">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Unit Terdata</span>
              <h3 className="text-2xl font-bold mt-1">{countUnits()} Unit</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-emerald-500">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Unit Kosong / Ready</span>
              <h3 className="text-2xl font-bold mt-1">{countUnits('available')} Unit</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-rose-500">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Pending Booking</span>
              <h3 className="text-2xl font-bold mt-1">{bookings.filter(b => b.status === 'pending_approval').length} berkas</h3>
            </div>
          </div>
        </div>

        {/* Progress chart or simple logs */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
            Penghuni Baru Rusunawa & Rusunami Terkini
          </h3>
          <div className="space-y-4">
            {bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{b.applicantName}</p>
                  <p className="text-slate-400 mt-0.5">{b.rusunName} - Unit {b.unitNumber} ({b.type})</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[9px] uppercase tracking-wider ${
                  b.status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {b.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SETUP DATA RUSUN ---
  if (activeMenu === 'rusun_setup') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tambah Bangunan Rusun
          </h3>
          <form onSubmit={handleRusunSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Rusun</label>
              <input 
                type="text" 
                value={rusunForm.name}
                onChange={e => setRusunForm({...rusunForm, name: e.target.value})}
                placeholder="cth: Rusunawa Pinus Elok" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tipe Pengelolaan</label>
              <select 
                value={rusunForm.type}
                onChange={e => setRusunForm({...rusunForm, type: e.target.value})}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="Rusunawa (Sewa)">Rusunawa (Sewa Rakyat)</option>
                <option value="Rusunami (Milik)">Rusunami (Hak Milik)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lokasi</label>
              <textarea 
                value={rusunForm.address}
                onChange={e => setRusunForm({...rusunForm, address: e.target.value})}
                placeholder="Jl. Raya Pinus No. 12..." 
                className="glass-input text-xs min-h-[80px]" 
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Rusun</span>
            </button>
          </form>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Registry Rusun Aktif
          </h3>
          <div className="space-y-4">
            {rusun.map((r) => (
              <div key={r.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-start hover:border-slate-400 transition">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{r.name}</h4>
                  <p className="text-xs text-slate-400">{r.address}</p>
                  <div className="inline-block px-2.5 py-0.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-[9px] font-bold text-orange-500 mt-2 uppercase">
                    {r.type}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400 font-semibold">
                  {r.towers.length} Blok / Tower
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SETUP BLOK / TOWER ---
  if (activeMenu === 'tower_setup') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tambah Blok / Tower
          </h3>
          <form onSubmit={handleTowerSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Lokasi Rusun</label>
              <select 
                value={towerForm.rusunId}
                onChange={e => setTowerForm({ ...towerForm, rusunId: e.target.value, name: '', nameMode: 'manual' })}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- Pilih Lokasi --</option>
                {rusun.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Blok / Tower</label>
              {towerForm.nameMode === 'search' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={towerSearch}
                      onChange={(e) => {
                        setTowerSearch(e.target.value);
                        setTowerSearchOpen(true);
                      }}
                      onFocus={() => setTowerSearchOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => setTowerSearchOpen(false), 120);
                      }}
                      placeholder="Cari nama blok / tower..."
                      disabled={!towerForm.rusunId}
                      className="glass-input text-xs w-full bg-white dark:bg-slate-900 disabled:opacity-60 pr-10"
                    />
                    {towerForm.rusunId && towerSearchOpen && filteredTowerSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-md">
                        {filteredTowerSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setTowerForm({
                                ...towerForm,
                                name: item.name,
                                floorCount: String(item.floorCount),
                                nameMode: 'search'
                              });
                              setTowerSearch(`${item.name} · ${item.floorCount} Lantai`);
                              setTowerSearchOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-orange-500/10 transition flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Value: {item.name} / Lantai {item.floorCount} </div>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold uppercase text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full"> Lantai {item.floorCount} </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {towerForm.rusunId && towerSearchOpen && towerSearch.trim() && filteredTowerSuggestions.length === 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl px-4 py-3 text-xs text-slate-400">
                        Tidak ada tower yang cocok. Gunakan mode manual jika ingin menambah nama baru.
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTowerForm({ ...towerForm, nameMode: 'manual', name: '' });
                      setTowerSearch('');
                      setTowerSearchOpen(false);
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600"
                  >
                    Tambah Nama Blok / Tower Manual
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={towerForm.name}
                    onChange={e => setTowerForm({...towerForm, name: e.target.value})}
                    placeholder="cth: Block C, Tower Samawa 2" 
                    className="glass-input text-xs w-full bg-white dark:bg-slate-900 disabled:opacity-60 pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTowerForm({ ...towerForm, nameMode: 'search', name: '' });
                      setTowerSearch('');
                      setTowerSearchOpen(false);
                    }}
                    className="text-[10px] flex flex-row items-center gap-8 font-bold uppercase tracking-wider text-red-500 hover:text-red-600"
                  >
                    Cari Nama Blok/Tower 
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data Lantai Tersedia</label>
              <input
                type="number"
                min="1"
                value={towerForm.floorCount}
                onChange={(e) => setTowerForm({ ...towerForm, floorCount: e.target.value })}
                placeholder="cth: 2"
                title="Isi data lantai yang tersedia pada tower ini (contoh: 2 berarti lantai 1 dan 2 tersedia)."
                className="glass-input text-xs"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Tower</span>
            </button>
          </form>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Daftar Blok / Tower
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              value={towerFilterInput}
              onChange={(e) => setTowerFilterInput(e.target.value)}
              placeholder="Cari nama tower, rusun, atau lantai..."
              className="glass-input text-xs flex-1"
            />
            <button
              type="button"
              onClick={() => {
                setTowerFilterKeyword(towerFilterInput);
                setTowerListPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold uppercase tracking-wider"
            >
              Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Nama Blok / Tower</th>
                  <th className="py-2.5 px-3 font-semibold">Lokasi Rusun</th>
                  <th className="py-2.5 px-3 font-semibold">Lantai</th>
                  <th className="py-2.5 px-3 font-semibold">Total Unit</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedTowerRows.map((row) => (
                    <tr key={row.id} className="hover:bg-orange-500/5">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{row.name}</td>
                      <td className="py-3 px-3 text-slate-400">{row.rusunName}</td>
                      <td className="py-3 px-3 text-slate-400">{row.floorCount}</td>
                      <td className="py-3 px-3 font-semibold">{row.unitTotal} Unit</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditTower(row, row.rusunId)}
                            className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                            title="Update tower"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTower(row, row.rusunName)}
                            className="p-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition"
                            title="Delete tower"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
                {pagedTowerRows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-400 italic">Data blok / tower tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={safeTowerPage} totalPages={totalTowerPages} onPageChange={setTowerListPage} />
        </div>
      </div>
    );
  }

  // --- SETUP UNIT per BLOK ---
  if (activeMenu === 'unit_setup') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tambah Unit Kamar
          </h3>
          <form onSubmit={handleUnitSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Rusun</label>
              <select 
                value={unitForm.rusunId}
                onChange={e => {
                  setUnitForm({ ...unitForm, rusunId: e.target.value, towerId: '', floor: '', number: '' });
                  setUnitTowerSearch('');
                  setUnitTowerSearchOpen(false);
                }}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- Pilih --</option>
                {rusun.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Blok / Tower</label>
              <div className="relative">
                <input
                  type="text"
                  value={unitTowerSearch}
                  onChange={(e) => {
                    setUnitTowerSearch(e.target.value);
                    setUnitTowerSearchOpen(true);
                  }}
                  onFocus={() => setUnitTowerSearchOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setUnitTowerSearchOpen(false), 120);
                  }}
                  placeholder="Cari nama blok / tower..."
                  disabled={!unitForm.rusunId}
                  className="glass-input text-xs w-full bg-white dark:bg-slate-900 disabled:opacity-60"
                />

                {unitForm.rusunId && unitTowerSearchOpen && filteredUnitTowerSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-md">
                    {filteredUnitTowerSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const nextTower = towersList.find((tower) => tower.id === item.id) || null;
                          const nextFloor = String(item.floorCount);

                          setUnitForm({
                            ...unitForm,
                            towerId: item.id,
                            floor: nextFloor,
                            number: nextTower ? getNextUnitNumber(nextTower, nextFloor) : ''
                          });
                          setUnitTowerSearch(`${item.name} · ${item.floorCount} Lantai`);
                          setUnitTowerSearchOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-500/10 transition flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Lantai {item.floorCount} </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full">Lantai {item.floorCount} </span>
                      </button>
                    ))}
                  </div>
                )}

                {unitForm.rusunId && unitTowerSearchOpen && unitTowerSearch.trim() && filteredUnitTowerSuggestions.length === 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl px-4 py-3 text-xs text-slate-400">
                    Tower tidak ditemukan untuk rusun yang dipilih.
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Lantai</label>
                <select
                  value={unitForm.floor}
                  onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value, number: selectedTowerForUnit ? getNextUnitNumber(selectedTowerForUnit, e.target.value) : '' })}
                  disabled={!unitForm.towerId}
                  className="glass-input text-xs bg-white dark:bg-slate-900"
                >
                  <option value="">-- Pilih --</option>
                  {availableFloors.map((floor) => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor Unit Otomatis</label>
                <input 
                  type="text" 
                  value={unitForm.number || autoUnitNumber}
                  readOnly
                  placeholder="A-101" 
                  className="glass-input text-xs bg-slate-100 dark:bg-slate-800 opacity-80" 
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Nomor unit dibangkitkan otomatis dari urutan terakhir pada tower dan lantai yang dipilih.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Biaya / Harga Sewa bulanan (Rp)</label>
              <input 
                type="number" 
                value={unitForm.price}
                onChange={e => setUnitForm({...unitForm, price: e.target.value})}
                placeholder="450000" 
                className="glass-input text-xs" 
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Unit</span>
            </button>
          </form>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Status Unit Kamar
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              value={unitFilterInput}
              onChange={(e) => setUnitFilterInput(e.target.value)}
              placeholder="Cari unit, tower, rusun, lantai, atau status..."
              className="glass-input text-xs flex-1"
            />
            <button
              type="button"
              onClick={() => {
                setUnitFilterKeyword(unitFilterInput);
                setUnitListPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold uppercase tracking-wider"
            >
              Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Nomor Unit</th>
                  <th className="py-2.5 px-3 font-semibold">Blok / Tower</th>
                  <th className="py-2.5 px-3 font-semibold">Lokasi</th>
                  <th className="py-2.5 px-3 font-semibold">Lantai</th>
                  <th className="py-2.5 px-3 font-semibold">Harga Sewa</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedUnitRows.map((row) => (
                      <tr key={row.id} className="hover:bg-orange-500/5">
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{row.number}</td>
                        <td className="py-3 px-3 text-slate-400">{row.towerName}</td>
                        <td className="py-3 px-3 text-slate-400">{row.rusunName}</td>
                        <td className="py-3 px-3 text-slate-400">{row.floor}</td>
                        <td className="py-3 px-3 font-medium">Rp {row.price.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                            row.status === 'available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            row.status === 'occupied' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            row.status === 'booked' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                ))}
                {pagedUnitRows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-slate-400 italic">Data unit tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={safeUnitPage} totalPages={totalUnitPages} onPageChange={setUnitListPage} />
        </div>
      </div>
    );
  }

  // --- VENDORS & CONSTRUCTION MATERIALS ---
  if (activeMenu === 'vendors') {
    return (
      <div className="space-y-6">
        {/* Vendor Masters */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Data Master Vendor Perawatan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { company: 'PT. Bangun Graha Mandiri', type: 'MEP & Elevator Specialist', phone: '021-5551234', address: 'Kuningan, Jakarta Selatan' },
              { company: 'CV. Tirta Kencana', type: 'Sistem Pompa & Distribusi Air', phone: '021-8884321', address: 'Pulogadung, Jakarta Timur' }
            ].map((v, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{v.company}</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Spesialisasi: <span className="font-semibold text-orange-500">{v.type}</span></p>
                  <p>Telepon: <span>{v.phone}</span></p>
                  <p>Alamat: <span>{v.address}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials Construction */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Material Pembangunan Rusun
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Nama Material</th>
                  <th className="py-2.5 px-3 font-semibold">Kategori Dasar</th>
                  <th className="py-2.5 px-3 font-semibold">Satuan Barang</th>
                  <th className="py-2.5 px-3 font-semibold">Stok Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[
                  { name: 'Semen Portland (PPC)', cat: 'Struktur Beton', unit: 'Sak @ 50kg', qty: '120 Sak' },
                  { name: 'Baja Tulangan U-24', cat: 'Besi & Struktur', unit: 'Batang @ 12m', qty: '450 Batang' },
                  { name: 'Waterproofing Coating Sika', cat: 'Pelapis Kebocoran', unit: 'Pail @ 20kg', qty: '15 Pail' }
                ].map((mat, idx) => (
                  <tr key={idx} className="hover:bg-orange-500/5">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{mat.name}</td>
                    <td className="py-3 px-3 text-slate-400">{mat.cat}</td>
                    <td className="py-3 px-3 text-slate-400">{mat.unit}</td>
                    <td className="py-3 px-3 font-semibold text-orange-500">{mat.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- DATA BOOKING ONLINE & PENDAFTARAN ---
  if (activeMenu === 'bookings' || activeMenu === 'registrations') {
    const pagedBookings = paginateItems(bookings, bookingsPage);
    const totalBookingPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));

    return (
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Pemrosesan Pendaftaran & Booking Online
          </h3>
          <p className="text-xs text-slate-400 mt-1">Daftar permohonan hunian sewa rusun oleh masyarakat umum dan warga relokasi.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Pemohon</th>
                <th className="py-2.5 px-3 font-semibold">Kategori Rusun</th>
                <th className="py-2.5 px-3 font-semibold">Nomor Unit</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal Kirim</th>
                <th className="py-2.5 px-3 font-semibold">Dokumen</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pagedBookings.map((b) => (
                <tr key={b.id} className="hover:bg-orange-500/5">
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{b.applicantName}</div>
                    <div className="text-[10px] text-slate-400">NIK: {b.nik}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded font-semibold text-[10px]">
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                    {b.unitNumber} <span className="text-[10px] font-normal text-slate-400">({b.rusunName})</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{new Date(b.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex gap-1">
                      <button className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>KTP</span>
                      </button>
                      <button className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>KK</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditBooking(b)}
                        className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {b.status === 'pending_approval' ? (
                        <span className="text-amber-500 font-bold text-[10px] uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Menunggu Pimpinan
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[9px] uppercase tracking-wider ${
                          b.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {b.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={bookingsPage} totalPages={totalBookingPages} onPageChange={setBookingsPage} />
        </div>
      </div>
    );
  }

  // --- BTPP CERTIFICATE HANDOVER ---
  if (activeMenu === 'btpp_handover') {
    const pagedBtpp = paginateItems(btpp, btppPage);
    const totalBtppPages = Math.max(1, Math.ceil(btpp.length / PAGE_SIZE));

    return (
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Penyerahan BTPP (Buku Tanda Pemilikan Perumahan) Rusunami
          </h3>
          <p className="text-xs text-slate-400 mt-1">Daftar serah terima hak milik unit rusunami pasca pelunasan berkas administrasi.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Nama Pemilik</th>
                <th className="py-2.5 px-3 font-semibold">Unit Rusunami</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal Pengajuan</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal Penyerahan</th>
                <th className="py-2.5 px-3 font-semibold">Keterangan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pagedBtpp.map((b) => (
                <tr key={b.id} className="hover:bg-orange-500/5">
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{b.tenantName}</td>
                  <td className="py-3 px-3 font-semibold">{b.unitNumber}</td>
                  <td className="py-3 px-3 text-slate-400">{b.submissionDate}</td>
                  <td className="py-3 px-3 text-slate-400">{b.handoverDate || '-'}</td>
                  <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{b.notes}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditBtpp(b)}
                        className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[9px] uppercase tracking-wider ${
                        b.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={btppPage} totalPages={totalBtppPages} onPageChange={setBtppPage} />
        </div>
      </div>
    );
  }

  // --- BILLING INVOICES & PAYMENTS ---
  if (activeMenu === 'billing_invoices') {
    const pagedBillings = paginateItems(tagihan, billingPage);
    const totalBillingPages = Math.max(1, Math.ceil(tagihan.length / PAGE_SIZE));

    return (
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Data Status Pembayaran & Tagihan
          </h3>
          <p className="text-xs text-slate-400 mt-1">Daftar penagihan uang sewa bulanan dan pembayaran utilitas (listrik/air).</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Nama Penghuni</th>
                <th className="py-2.5 px-3 font-semibold">Nomor Unit</th>
                <th className="py-2.5 px-3 font-semibold">Jenis Tagihan</th>
                <th className="py-2.5 px-3 font-semibold">Periode Bulan</th>
                <th className="py-2.5 px-3 font-semibold">Jumlah Tagihan</th>
                <th className="py-2.5 px-3 font-semibold">Jatuh Tempo</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pagedBillings.map((t) => (
                <tr key={t.id} className="hover:bg-orange-500/5">
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{t.tenantName}</td>
                  <td className="py-3 px-3 font-semibold">{t.unitNumber || 'A-101'}</td>
                  <td className="py-3 px-3 text-slate-400">{t.type}</td>
                  <td className="py-3 px-3 font-medium">{t.month}</td>
                  <td className="py-3 px-3 font-bold">Rp {t.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-3 text-slate-400">{t.dueDate}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTagihan(t)}
                        className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[9px] uppercase tracking-wider ${
                        t.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        t.status === 'overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={billingPage} totalPages={totalBillingPages} onPageChange={setBillingPage} />
        </div>
      </div>
    );
  }

  // --- SURVEY RESULTS GRAPH ---
  if (activeMenu === 'survey_results') {
    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Laporan Kuesioner & Hasil Survei Kepuasan
          </h3>
          <p className="text-xs text-slate-400 mt-1">Akumulasi hasil pengisian angket/survey kepuasan pelayanan oleh warga rusun.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-4 bg-slate-900/10">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Rata-rata Penilaian Responden</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kebersihan Area Publik</span>
                  <span className="text-orange-500">4.1 / 5.0</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kecepatan Respon Keluhan</span>
                  <span className="text-orange-500">4.5 / 5.0</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Komentar & Saran Warga</h4>
            <div className="space-y-3 text-xs">
              {surveyResponses.map((r) => (
                <div key={r.id} className="bg-slate-500/5 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{r.tenantName}</span>
                    <span className="text-slate-400 font-normal">{r.date}</span>
                  </div>
                  <p className="text-slate-400 italic">"{r.answers['q-3'] || 'Tidak memberikan catatan.'}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
