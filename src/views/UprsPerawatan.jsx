import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { 
  Plus, Wrench, Calendar, FileText, CheckCircle, 
  AlertTriangle, Hammer, Users, ShieldAlert, Award, Edit2
} from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 5;

const paginateItems = (items, page) => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

export default function UprsPerawatan({ activeMenu }) {
  const { 
    contracts, addContract,
    inspections, addInspection, updateInspectionStatus,
    complaints, updateComplaintStatus,
    bookings, drawLotteryAndAssign, rusun, tagihan,
    editContractTransaction, editInspectionTransaction,
    editBookingTransaction, editTagihanTransaction
  } = useDb();

  const [contractForm, setContractForm] = useState({ vendorName: '', workType: '', startDate: '', endDate: '', budget: '' });
  const [inspectionForm, setInspectionForm] = useState({ area: '', inspector: '', date: '', findings: '', urgency: 'Medium' });
  const [lotteryForm, setLotteryForm] = useState({ bookingId: '', unitId: '' });
  const [contractsPage, setContractsPage] = useState(1);
  const [inspectionsPage, setInspectionsPage] = useState(1);
  const [lotteryPage, setLotteryPage] = useState(1);
  const [arrearsPage, setArrearsPage] = useState(1);

  // Handle contract submit
  const handleContractSubmit = (e) => {
    e.preventDefault();
    if (!contractForm.vendorName || !contractForm.workType || !contractForm.startDate || !contractForm.endDate || !contractForm.budget) return;
    addContract(contractForm.vendorName, contractForm.workType, contractForm.startDate, contractForm.endDate, contractForm.budget);
    setContractForm({ vendorName: '', workType: '', startDate: '', endDate: '', budget: '' });
  };

  // Handle inspection submit
  const handleInspectionSubmit = (e) => {
    e.preventDefault();
    if (!inspectionForm.area || !inspectionForm.inspector || !inspectionForm.date || !inspectionForm.findings) return;
    addInspection(inspectionForm.area, inspectionForm.inspector, inspectionForm.date, inspectionForm.findings, inspectionForm.urgency);
    setInspectionForm({ area: '', inspector: '', date: '', findings: '', urgency: 'Medium' });
  };

  // Handle lottery assign
  const handleLotterySubmit = (e) => {
    e.preventDefault();
    if (!lotteryForm.bookingId || !lotteryForm.unitId) return;
    drawLotteryAndAssign(lotteryForm.bookingId, lotteryForm.unitId);
    setLotteryForm({ bookingId: '', unitId: '' });
  };

  const handleEditContract = (item) => {
    const vendorName = window.prompt('Ubah nama vendor:', item.vendorName);
    if (vendorName === null) return;
    const budget = window.prompt('Ubah nilai kontrak:', String(item.budget));
    if (budget === null) return;
    const parsedBudget = Number(budget);
    editContractTransaction(item.id, {
      vendorName: vendorName.trim() || item.vendorName,
      budget: Number.isFinite(parsedBudget) ? parsedBudget : item.budget
    });
  };

  const handleEditInspection = (item) => {
    const findings = window.prompt('Ubah catatan temuan:', item.findings || '');
    if (findings === null) return;
    editInspectionTransaction(item.id, { findings });
  };

  const handleEditApprovedBooking = (item) => {
    const unitNumber = window.prompt('Ubah unit hasil lotere:', item.unitNumber || '');
    if (unitNumber === null) return;
    editBookingTransaction(item.id, { unitNumber: unitNumber.trim() || item.unitNumber });
  };

  const handleEditTunggakan = (item) => {
    const status = window.prompt('Ubah status tagihan:', item.status || 'unpaid');
    if (status === null) return;
    editTagihanTransaction(item.id, { status: status.trim() || item.status });
  };

  // Find all available units
  const getAvailableUnits = () => {
    const list = [];
    rusun.forEach(r => {
      r.towers.forEach(t => {
        t.units.forEach(u => {
          if (u.status === 'available') {
            list.push({ ...u, rusunName: r.name, towerName: t.name });
          }
        });
      });
    });
    return list;
  };

  // Calculate unpaid totals
  const getUnpaidBills = () => {
    return tagihan.filter(t => t.status === 'unpaid' || t.status === 'overdue');
  };

  // --- STATS OVERVIEW ---
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-purple-500">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Kontrak Aktif Vendor</span>
              <h3 className="text-2xl font-bold mt-1">{contracts.filter(c => c.status === 'active').length} Kontrak</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-amber-500">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Inspeksi Terjadwal</span>
              <h3 className="text-2xl font-bold mt-1">{inspections.filter(i => i.status === 'scheduled').length} Tugas</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-rose-500">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Keluhan Warga (P2M)</span>
              <h3 className="text-2xl font-bold mt-1">{complaints.filter(c => c.status !== 'resolved').length} Laporan</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-red-500">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Warga Menunggak Sewa</span>
              <h3 className="text-2xl font-bold mt-1">{getUnpaidBills().length} Rekening</h3>
            </div>
          </div>
        </div>

        {/* Action log */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
            Pengaduan Teknis Rusun Aktif
          </h3>
          <div className="space-y-4">
            {complaints.filter(c => c.status !== 'resolved').slice(0, 3).map((c) => (
              <div key={c.id} className="flex justify-between items-start text-xs border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Unit {c.unitNumber} - {c.category}</p>
                  <p className="text-slate-400 leading-normal">{c.description}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateComplaintStatus(c.id, 'processing', 'Petugas UPRS sedang merespon.')}
                    className="px-2 py-1 bg-purple-500 text-white font-bold text-[9px] uppercase tracking-wider rounded hover:bg-purple-600 transition"
                  >
                    Proses
                  </button>
                  <button 
                    onClick={() => updateComplaintStatus(c.id, 'resolved', 'Perbaikan rampung dikerjakan.')}
                    className="px-2 py-1 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider rounded hover:bg-emerald-600 transition"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VENDOR CONTRACTS ---
  if (activeMenu === 'vendor_contracts') {
    const pagedContracts = paginateItems(contracts, contractsPage);
    const totalContractPages = Math.max(1, Math.ceil(contracts.length / PAGE_SIZE));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tambah Kontrak Vendor
          </h3>
          <form onSubmit={handleContractSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Perusahaan Vendor</label>
              <input 
                type="text" 
                value={contractForm.vendorName}
                onChange={e => setContractForm({...contractForm, vendorName: e.target.value})}
                placeholder="cth: PT. Lift Mekanikal" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Lingkup Pekerjaan</label>
              <input 
                type="text" 
                value={contractForm.workType}
                onChange={e => setContractForm({...contractForm, workType: e.target.value})}
                placeholder="cth: Perawatan Gedung & Lift" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mulai</label>
                <input 
                  type="date" 
                  value={contractForm.startDate}
                  onChange={e => setContractForm({...contractForm, startDate: e.target.value})}
                  className="glass-input text-xs" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Selesai</label>
                <input 
                  type="date" 
                  value={contractForm.endDate}
                  onChange={e => setContractForm({...contractForm, endDate: e.target.value})}
                  className="glass-input text-xs" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nilai Kontrak (Rp)</label>
              <input 
                type="number" 
                value={contractForm.budget}
                onChange={e => setContractForm({...contractForm, budget: e.target.value})}
                placeholder="50000000" 
                className="glass-input text-xs" 
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Kontrak</span>
            </button>
          </form>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Kontrak Vendor Terdaftar
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Vendor / Pekerjaan</th>
                  <th className="py-2.5 px-3 font-semibold">Masa Kontrak</th>
                  <th className="py-2.5 px-3 font-semibold">Anggaran</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-500/5">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{c.vendorName}</div>
                      <div className="text-[10px] text-slate-400">{c.workType}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{c.startDate} s/d {c.endDate}</td>
                    <td className="py-3 px-3 font-bold text-purple-500">Rp {c.budget.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditContract(c)}
                          className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/5 font-bold text-[9px] uppercase text-purple-500 tracking-wider">
                          {c.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={contractsPage} totalPages={totalContractPages} onPageChange={setContractsPage} />
          </div>
        </div>
      </div>
    );
  }

  // --- INSPECTION SCHEDULES ---
  if (activeMenu === 'maintenance_schedule' || activeMenu === 'field_inspections') {
    const pagedInspections = paginateItems(inspections, inspectionsPage);
    const totalInspectionPages = Math.max(1, Math.ceil(inspections.length / PAGE_SIZE));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Rencana Inspeksi Baru
          </h3>
          <form onSubmit={handleInspectionSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Area / Lokasi Fisik</label>
              <input 
                type="text" 
                value={inspectionForm.area}
                onChange={e => setInspectionForm({...inspectionForm, area: e.target.value})}
                placeholder="cth: Lift Block B, Atap Dak Beton" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Petugas Pemeriksa</label>
              <input 
                type="text" 
                value={inspectionForm.inspector}
                onChange={e => setInspectionForm({...inspectionForm, inspector: e.target.value})}
                placeholder="cth: Sulaeman (K3)" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Cek</label>
                <input 
                  type="date" 
                  value={inspectionForm.date}
                  onChange={e => setInspectionForm({...inspectionForm, date: e.target.value})}
                  className="glass-input text-xs" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Urgensi</label>
                <select 
                  value={inspectionForm.urgency}
                  onChange={e => setInspectionForm({...inspectionForm, urgency: e.target.value})}
                  className="glass-input text-xs bg-white dark:bg-slate-900"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Hasil Temuan / Catatan Awal</label>
              <textarea 
                value={inspectionForm.findings}
                onChange={e => setInspectionForm({...inspectionForm, findings: e.target.value})}
                placeholder="cth: Kabel lampu koridor terkelupas..." 
                className="glass-input text-xs min-h-[70px] resize-none" 
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Inspeksi</span>
            </button>
          </form>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Agenda Inspeksi Lapangan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Petugas / Area</th>
                  <th className="py-2.5 px-3 font-semibold">Temuan Lapangan</th>
                  <th className="py-2.5 px-3 font-semibold">Jadwal</th>
                  <th className="py-2.5 px-3 font-semibold">Urgensi</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedInspections.map((i) => (
                  <tr key={i.id} className="hover:bg-purple-500/5">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{i.area}</div>
                      <div className="text-[10px] text-slate-400">Pemeriksa: {i.inspector}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{i.findings}</td>
                    <td className="py-3 px-3 text-slate-400 font-semibold">{i.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        i.urgency === 'High' ? 'bg-red-500/10 text-red-500' :
                        i.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {i.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditInspection(i)}
                          className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {i.status === 'scheduled' ? (
                          <button 
                            onClick={() => updateInspectionStatus(i.id, 'completed')}
                            className="px-2 py-0.5 bg-emerald-500 text-white font-bold text-[9px] rounded uppercase hover:bg-emerald-600 transition"
                          >
                            Selesai
                          </button>
                        ) : (
                          <span className="text-emerald-500 font-semibold">✔ Clear</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={inspectionsPage} totalPages={totalInspectionPages} onPageChange={setInspectionsPage} />
          </div>
        </div>
      </div>
    );
  }

  // --- RESIDENT LOTTERIES & MATCHING ---
  if (activeMenu === 'tenant_lottery') {
    const pendingBookings = bookings.filter(b => b.status === 'pending_approval');
    const availableUnits = getAvailableUnits();
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    const pagedApprovedBookings = paginateItems(approvedBookings, lotteryPage);
    const totalLotteryPages = Math.max(1, Math.ceil(approvedBookings.length / PAGE_SIZE));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Undian & Penetapan Hunian
          </h3>
          <form onSubmit={handleLotterySubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pendaftaran Terverifikasi</label>
              <select 
                value={lotteryForm.bookingId}
                onChange={e => setLotteryForm({...lotteryForm, bookingId: e.target.value})}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- Pilih Calon Penghuni --</option>
                {pendingBookings.map(b => (
                  <option key={b.id} value={b.id}>{b.applicantName} ({b.type})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Rusun Kosong (Tersedia)</label>
              <select 
                value={lotteryForm.unitId}
                onChange={e => setLotteryForm({...lotteryForm, unitId: e.target.value})}
                disabled={!lotteryForm.bookingId}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- Pilih Kamar --</option>
                {availableUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.rusunName} - {u.towerName} - Kamar {u.number}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-xs py-2.5">
              <Award className="w-4 h-4" />
              <span>Jalankan Setup Penghuni</span>
            </button>
          </form>
        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Hasil Setup Penghuni & Lotere
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Nama Warga</th>
                  <th className="py-2.5 px-3 font-semibold">Rusun & Unit</th>
                  <th className="py-2.5 px-3 font-semibold">NIK Penduduk</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status Hunian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedApprovedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-purple-500/5">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{b.applicantName}</td>
                    <td className="py-3 px-3 text-slate-400">{b.rusunName} - Unit {b.unitNumber}</td>
                    <td className="py-3 px-3 text-slate-400">{b.nik}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditApprovedBooking(b)}
                          className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider">
                          Terdata Masuk
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={lotteryPage} totalPages={totalLotteryPages} onPageChange={setLotteryPage} />
          </div>
        </div>
      </div>
    );
  }

  // --- RENT ARREARS ---
  if (activeMenu === 'tenant_arrears') {
    const unpaid = getUnpaidBills();
    const pagedUnpaid = paginateItems(unpaid, arrearsPage);
    const totalArrearsPages = Math.max(1, Math.ceil(unpaid.length / PAGE_SIZE));

    return (
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Rekapitulasi Tunggakan Pembayaran Sewa
          </h3>
          <p className="text-xs text-slate-400 mt-1">Daftar tagihan yang melewati masa tenggang batas pembayaran bulanan.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Nama Warga</th>
                <th className="py-2.5 px-3 font-semibold">Unit Kamar</th>
                <th className="py-2.5 px-3 font-semibold">Periode Bulan</th>
                <th className="py-2.5 px-3 font-semibold">Jumlah Tunggakan</th>
                <th className="py-2.5 px-3 font-semibold">Jatuh Tempo</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status Kewajiban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pagedUnpaid.map((t) => (
                <tr key={t.id} className="hover:bg-purple-500/5">
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{t.tenantName}</td>
                  <td className="py-3 px-3 font-semibold">{t.unitNumber || 'A-101'}</td>
                  <td className="py-3 px-3 text-slate-400">{t.month}</td>
                  <td className="py-3 px-3 font-extrabold text-red-500">Rp {t.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-3 text-slate-400 font-semibold">{t.dueDate}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTunggakan(t)}
                        className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[9px] uppercase tracking-wider animate-pulse">
                        {t.status === 'overdue' ? 'Tunggak Keras' : 'Belum Bayar'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={arrearsPage} totalPages={totalArrearsPages} onPageChange={setArrearsPage} />
        </div>
      </div>
    );
  }

  // --- LEASE CLOSURES ---
  if (activeMenu === 'lease_closures') {
    return (
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Penutupan Kontrak Sewa Rusunawa
          </h3>
          <p className="text-xs text-slate-400 mt-1">Pengajuan pemutusan hubungan sewa hunian warga secara resmi.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Nama Penghuni</th>
                <th className="py-2.5 px-3 font-semibold">Nomor Unit</th>
                <th className="py-2.5 px-3 font-semibold">Alasan Penutupan</th>
                <th className="py-2.5 px-3 font-semibold">Kewajiban Tersisa</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status Penutupan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <tr className="hover:bg-purple-500/5">
                <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">Joni Iskandar</td>
                <td className="py-3 px-3 font-semibold">A-203</td>
                <td className="py-3 px-3 text-slate-400">Pindah domisili ke luar kota kerja baru.</td>
                <td className="py-3 px-3 font-medium text-emerald-500">Lunas / Nihil</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider">
                    Selesai Ditutup
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
