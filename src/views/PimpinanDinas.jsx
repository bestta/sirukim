import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { 
  Check, X, FileText, TrendingUp, DollarSign, Home, 
  Clock, AlertTriangle, ShieldCheck, Printer, BarChart2, Edit2
} from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 5;

const paginateItems = (items, page) => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

export default function PimpinanDinas({ activeMenu }) {
  const { 
    bookings, approveBooking,
    btpp, updateBtppStatus,
    rusun, tagihan,
    editBookingTransaction, editBtppTransaction
  } = useDb();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingApprovalPage, setBookingApprovalPage] = useState(1);
  const [btppApprovalPage, setBtppApprovalPage] = useState(1);

  // Helpers
  const countOccupiedUnits = () => {
    let count = 0;
    rusun.forEach(r => {
      r.towers.forEach(t => {
        t.units.forEach(u => {
          if (u.status === 'occupied') count++;
        });
      });
    });
    return count;
  };

  const calculateTotalRevenue = () => {
    return tagihan
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalArrears = () => {
    return tagihan
      .filter(t => t.status === 'overdue' || t.status === 'unpaid')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Simulated reports print
  const handlePrint = (reportName) => {
    alert(`Mencetak Laporan: ${reportName}...\nSimulasi konversi ke format PDF selesai.`);
  };

  const handleEditPendingBooking = (item) => {
    const phone = window.prompt('Ubah no HP pemohon:', item.phone || '');
    if (phone === null) return;
    editBookingTransaction(item.id, { phone: phone.trim() || item.phone });
  };

  const handleEditPendingBtpp = (item) => {
    const notes = window.prompt('Ubah catatan pengajuan BTPP:', item.notes || '');
    if (notes === null) return;
    editBtppTransaction(item.id, { notes });
  };

  // --- EXECUTIVE DASHBOARD VIEW ---
  if (activeMenu === 'dashboard') {
    const totalRev = calculateTotalRevenue();
    const totalArr = calculateTotalArrears();
    const occupiedCount = countOccupiedUnits();

    // Chart constants for target vs actual
    const targetRevenue = 5000000; // Rp 5jt target
    const actualRevenue = totalRev;
    const targetWidth = 100;
    const actualWidth = Math.min(100, (actualRevenue / targetRevenue) * 100);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-emerald-500">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Realisasi Pendapatan</span>
              <h3 className="text-2xl font-bold mt-1 text-emerald-500">Rp {totalRev.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-red-500">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Tunggakan</span>
              <h3 className="text-2xl font-bold mt-1 text-red-500">Rp {totalArr.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-blue-500">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Unit Terhuni</span>
              <h3 className="text-2xl font-bold mt-1">{occupiedCount} Unit</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-amber-500">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Approval Tertunda</span>
              <h3 className="text-2xl font-bold mt-1">
                {bookings.filter(b => b.status === 'pending_approval').length + btpp.filter(b => b.status === 'pending').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Custom SVG Target vs Realization Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Perbandingan Target vs Realisasi Keuangan</h4>
            
            <div className="space-y-4 pt-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Target Anggaran Pendapatan</span>
                  <span>Rp {targetRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full">
                  <div className="h-full bg-slate-400 dark:bg-slate-700 rounded-full" style={{ width: `${targetWidth}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-emerald-500">
                  <span>Realisasi Penerimaan Sewa</span>
                  <span>Rp {actualRevenue.toLocaleString('id-ID')} ({actualWidth.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-500" style={{ width: `${actualWidth}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Metrik Hunian Wilayah DKI</h4>
            <div className="flex items-center gap-6 pt-2">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeWidth="3" strokeDasharray="65, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-bold">65%</span>
                  <span className="text-[8px] text-slate-400 font-semibold uppercase">Tingkat Huni</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span>Unit Dihuni: {occupiedCount} Unit</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-slate-400 dark:bg-slate-700"></span>
                  <span>Unit Kosong: 5 Unit</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TARGET VS REALIZATION (Financial Details) ---
  if (activeMenu === 'financial_revenue') {
    const totalRev = calculateTotalRevenue();
    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Rincian Penerimaan & Realisasi Pendapatan Sewa
          </h3>
          <p className="text-xs text-slate-400 mt-1">Audit rincian pendapatan sewa rusunawa bulanan dan pencocokan target APBD.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Bulan</th>
                <th className="py-2.5 px-3 font-semibold">Target Anggaran</th>
                <th className="py-2.5 px-3 font-semibold">Realisasi Penerimaan</th>
                <th className="py-2.5 px-3 font-semibold">Persentase</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {[
                { month: 'Mei 2026', target: 2000000, actual: 2000000, pct: '100%' },
                { month: 'Juni 2026', target: 3000000, actual: totalRev, pct: `${((totalRev / 3000000) * 100).toFixed(0)}%` }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-500/5">
                  <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100">{row.month}</td>
                  <td className="py-3.5 px-3">Rp {row.target.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-500">Rp {row.actual.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-400">{row.pct}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider">
                      Tercapai
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- APPROVALS CENTER ---
  if (activeMenu === 'approvals_inbox') {
    const pendingBookings = bookings.filter(b => b.status === 'pending_approval');
    const pendingBtpp = btpp.filter(b => b.status === 'pending');
    const pagedPendingBookings = paginateItems(pendingBookings, bookingApprovalPage);
    const pagedPendingBtpp = paginateItems(pendingBtpp, btppApprovalPage);
    const totalBookingApprovalPages = Math.max(1, Math.ceil(pendingBookings.length / PAGE_SIZE));
    const totalBtppApprovalPages = Math.max(1, Math.ceil(pendingBtpp.length / PAGE_SIZE));

    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Kotak Masuk Persetujuan (Approvals Center)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Review pengajuan pendaftaran sewa unit dan serah terima buku tanda kepemilikan.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
              activeTab === 'bookings' 
                ? 'bg-emerald-500 text-white' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            Pendaftaran & Booking ({pendingBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('btpp')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
              activeTab === 'btpp' 
                ? 'bg-emerald-500 text-white' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            Serah Terima BTPP ({pendingBtpp.length})
          </button>
        </div>

        {activeTab === 'bookings' ? (
          <div className="space-y-4">
            {pagedPendingBookings.map((b) => (
              <div key={b.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center hover:border-slate-400 transition">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{b.applicantName}</h4>
                  <p className="text-xs text-slate-400">
                    Mendaftar pada <span className="font-semibold text-slate-300">{b.rusunName} ({b.type})</span> - Kamar {b.unitNumber}
                  </p>
                  <p className="text-[10px] text-slate-400">No. HP: {b.phone}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPendingBooking(b)}
                    className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition shadow-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      approveBooking(b.id, true);
                      alert('Booking berhasil disetujui!');
                    }}
                    className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-md"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      approveBooking(b.id, false);
                      alert('Booking berhasil ditolak!');
                    }}
                    className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <Pagination page={bookingApprovalPage} totalPages={totalBookingApprovalPages} onPageChange={setBookingApprovalPage} />
            {pendingBookings.length === 0 && (
              <div className="text-center py-6 text-slate-400 italic text-xs">Semua permohonan booking selesai ditinjau.</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pagedPendingBtpp.map((b) => (
              <div key={b.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center hover:border-slate-400 transition">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{b.tenantName}</h4>
                  <p className="text-xs text-slate-400">
                    Pengajuan BTPP untuk <span className="font-semibold text-slate-300">Unit Kamar {b.unitNumber}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Tanggal Pengajuan: {b.submissionDate}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPendingBtpp(b)}
                    className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition shadow-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      updateBtppStatus(b.id, 'approved', 'BTPP disetujui & ditandatangani Kepala Dinas.');
                      alert('Pengajuan BTPP disetujui!');
                    }}
                    className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-md"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      updateBtppStatus(b.id, 'rejected', 'Berkas administrasi tidak lengkap.');
                      alert('Pengajuan BTPP ditolak!');
                    }}
                    className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <Pagination page={btppApprovalPage} totalPages={totalBtppApprovalPages} onPageChange={setBtppApprovalPage} />
            {pendingBtpp.length === 0 && (
              <div className="text-center py-6 text-slate-400 italic text-xs">Semua permohonan BTPP selesai ditinjau.</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- PRINT REPORTS ---
  if (activeMenu === 'financial_revenue' || activeMenu === 'analytical_reports') {
    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Ekspor & Laporan Cetak SIRUKIM
          </h3>
          <p className="text-xs text-slate-400 mt-1">Cetak rekapitulasi data resmi untuk keperluan audit dinas perumahan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: 'Laporan Tingkat Huni Rusun', desc: 'Detail occupancy rate sewa per wilayah DKI.', icon: Home, file: 'laporan_huni_2026.pdf' },
            { title: 'Laporan Realisasi Pendapatan', desc: 'Penerimaan sewa vs target anggaran daerah.', icon: DollarSign, file: 'laporan_keuangan_2026.pdf' },
            { title: 'Laporan Rekapitulasi Kerusakan', desc: 'Indikator kinerja penanganan keluhan UPRS.', icon: FileText, file: 'laporan_kerusakan_2026.pdf' }
          ].map((rep, idx) => (
            <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between h-40">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                  <rep.icon className="w-4 h-4 text-emerald-500" />
                  <span>{rep.title}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{rep.desc}</p>
              </div>
              <button 
                onClick={() => handlePrint(rep.title)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-bold text-emerald-500 transition-all duration-200"
              >
                <Printer className="w-4.5 h-4.5" />
                <span>Simpan PDF / Cetak</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
