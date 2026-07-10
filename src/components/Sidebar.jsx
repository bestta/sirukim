import React, { useEffect, useMemo, useState } from 'react';
import { useDb } from '../context/DbContext';
import { 
  X, LogOut, ChevronRight
} from 'lucide-react';
import logoDki from '../../logo/logo-dki.png';

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeMenu, 
  setActiveMenu,
  onLogout
}) {
  const { currentUser } = useDb();
  const [masterTransaksiOpen, setMasterTransaksiOpen] = useState(activeMenu.startsWith('master_transaksi_'));

  // Color config based on current user role
  const roleColors = {
    administrator: {
      sidebarBg: 'bg-slate-900 border-slate-800',
      activeText: 'text-slate-100',
      activeBg: 'bg-slate-800 border-slate-500',
      badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    },
    entry_data: {
      sidebarBg: 'bg-orange-900 border-orange-800',
      activeText: 'text-orange-100',
      activeBg: 'bg-orange-800 border-orange-400',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    },
    uprs_perawatan: {
      sidebarBg: 'bg-purple-900 border-purple-800',
      activeText: 'text-purple-100',
      activeBg: 'bg-purple-800 border-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    penghuni: {
      sidebarBg: 'bg-orange-900 border-orange-800',
      activeText: 'text-orange-100',
      activeBg: 'bg-orange-800 border-orange-400',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    },
    pimpinan_dinas: {
      sidebarBg: 'bg-emerald-900 border-emerald-800',
      activeText: 'text-emerald-100',
      activeBg: 'bg-emerald-800 border-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
  };

  const currentTheme = roleColors[currentUser?.role] || roleColors.administrator;

  // Menu items list mapping
  const menuConfig = {
    administrator: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'profile', label: 'Edit Profil' },
      { id: 'roles', label: 'Master Data User Grup' },
      { id: 'users', label: 'Master Data User' },
      { id: 'facilities', label: 'Master Data Fasilitas' },
      { id: 'regions', label: 'Master Data Wilayah' },
      { id: 'maintenance_depts', label: 'Master Bidang Perawatan' },
      { id: 'questionnaire_setup', label: 'Setup Kuisioner' },
      { id: 'master_transaksi_pendaftaran', label: 'Master Transaksi: Pendaftaran' },
      { id: 'master_transaksi_pemeriksaan', label: 'Master Transaksi: Pemeriksaan Berkas' },
      { id: 'master_transaksi_persetujuan', label: 'Master Transaksi: Persetujuan' },
      { id: 'master_transaksi_daftar_ulang', label: 'Master Transaksi: Pendaftaran Ulang' },
      { id: 'master_transaksi_serah_terima', label: 'Master Transaksi: Serah Terima Kunci' }
    ],
    entry_data: [
      { id: 'dashboard', label: 'Dashboard Overview' },
      { id: 'profile', label: 'Edit Profil' },
      { id: 'rusun_setup', label: 'Setup Data Rusun' },
      { id: 'tower_setup', label: 'Setup Blok / Tower' },
      { id: 'unit_setup', label: 'Setup Unit Rusun' },
      { id: 'vendors', label: 'Master Data Vendor' },
      { id: 'material_builders', label: 'Material Pembangunan' },
      { id: 'bookings', label: 'Booking Online' },
      { id: 'registrations', label: 'Pendaftaran Rusunawa' },
      { id: 'btpp_handover', label: 'Penyerahan BTPP' },
      { id: 'billing_invoices', label: 'Tagihan & Pembayaran' },
      { id: 'survey_results', label: 'Hasil Kuesioner' },
      { id: 'master_transaksi_pendaftaran', label: 'Master Transaksi: Pendaftaran' },
      { id: 'master_transaksi_pemeriksaan', label: 'Master Transaksi: Pemeriksaan Berkas' },
      { id: 'master_transaksi_persetujuan', label: 'Master Transaksi: Persetujuan' },
      { id: 'master_transaksi_daftar_ulang', label: 'Master Transaksi: Pendaftaran Ulang' },
      { id: 'master_transaksi_serah_terima', label: 'Master Transaksi: Serah Terima Kunci' }
    ],
    uprs_perawatan: [
      { id: 'dashboard', label: 'Dashboard UPRS' },
      { id: 'profile', label: 'Edit Profil' },
      { id: 'vendor_contracts', label: 'Kontrak Vendor' },
      { id: 'maintenance_schedule', label: 'Jadwal Perawatan Rutin' },
      { id: 'tenant_lottery', label: 'Setup Lotere Penghuni' },
      { id: 'field_inspections', label: 'Pemeriksaan Lapangan' },
      { id: 'tenant_arrears', label: 'Data Tunggakan' },
      { id: 'lease_closures', label: 'Penutupan Sewa' }
    ],
    penghuni: [
      { id: 'dashboard', label: 'Unit Saya' },
      { id: 'profile', label: 'Edit Profil' },
      { id: 'master_transaksi_pendaftaran', label: 'Master Transaksi: Pendaftaran Sewa Rusun' },
      { id: 'master_transaksi_pemeriksaan', label: 'Master Transaksi: Pemeriksaan Berkas' },
      { id: 'master_transaksi_persetujuan', label: 'Master Transaksi: Persetujuan' },
      { id: 'master_transaksi_daftar_ulang', label: 'Master Transaksi: Pendaftaran Ulang' },
      { id: 'master_transaksi_serah_terima', label: 'Master Transaksi: Serah Terima Kunci' },
      { id: 'my_bills', label: 'Tagihan & Pembayaran' },
      { id: 'btpp_request', label: 'Pengajuan BTPP' },
      { id: 'submit_complaint', label: 'Aduan & Keluhan' },
      { id: 'fill_survey', label: 'Kuesioner Evaluasi' }
    ],
    pimpinan_dinas: [
      { id: 'dashboard', label: 'Kinerja Eksekutif' },
      { id: 'profile', label: 'Edit Profil' },
      { id: 'financial_revenue', label: 'Target vs Realisasi' },
      { id: 'approvals_inbox', label: 'Kotak Persetujuan' },
      { id: 'analytical_reports', label: 'Laporan Cetak' },
      { id: 'master_transaksi_pendaftaran', label: 'Master Transaksi: Pendaftaran' },
      { id: 'master_transaksi_pemeriksaan', label: 'Master Transaksi: Pemeriksaan Berkas' },
      { id: 'master_transaksi_persetujuan', label: 'Master Transaksi: Persetujuan' },
      { id: 'master_transaksi_daftar_ulang', label: 'Master Transaksi: Pendaftaran Ulang' },
      { id: 'master_transaksi_serah_terima', label: 'Master Transaksi: Serah Terima Kunci' }
    ]
  };

  const items = menuConfig[currentUser?.role] || [];

  const masterTransaksiItems = useMemo(
    () => items.filter((item) => item.id.startsWith('master_transaksi_')),
    [items]
  );

  const masterTransaksiShortLabel = {
    master_transaksi_pendaftaran: 'Pendaftaran',
    master_transaksi_pemeriksaan: 'Pemeriksaan',
    master_transaksi_persetujuan: 'Persetujuan',
    master_transaksi_daftar_ulang: 'Daftar Ulang',
    master_transaksi_serah_terima: 'Serah Terima Kunci'
  };

  const regularItems = useMemo(
    () => items.filter((item) => !item.id.startsWith('master_transaksi_')),
    [items]
  );

  useEffect(() => {
    if (activeMenu.startsWith('master_transaksi_')) {
      setMasterTransaksiOpen(true);
    }
  }, [activeMenu]);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Main */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-full border-r backdrop-blur-md transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${currentTheme.sidebarBg}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img
              src={logoDki}
              alt="Logo DKI Jakarta"
              className="w-10 h-10 rounded-lg object-contain bg-white/90 p-1"
            />
            <div>
              <h1 className="text-[10px] font-bold text-white uppercase tracking-wider">Sistem Informasi Perumahan dan Permukiman</h1>
              <span className="text-[10px] text-slate-100/90 font-semibold uppercase tracking-wider">Provinsi DKI Jakarta</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Info */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
              {currentUser?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-slate-200 truncate">{currentUser?.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{currentUser?.email || 'Active User'}</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider mt-3 uppercase ${currentTheme.badge}`}>
            <span className="w-1 h-1 rounded-full bg-current"></span>
            {currentUser?.role.replace('_', ' ')}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow px-3 py-3 overflow-y-auto space-y-1">
          {regularItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                activeMenu === item.id 
                  ? `${currentTheme.activeBg} ${currentTheme.activeText} border-transparent shadow-md`
                  : 'bg-transparent border-transparent text-slate-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.label}</span>
              {activeMenu === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}

          {masterTransaksiItems.length > 0 && (
            <div className="space-y-1">
              <button
                onClick={() => setMasterTransaksiOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                  activeMenu.startsWith('master_transaksi_')
                    ? `${currentTheme.activeBg} ${currentTheme.activeText} border-transparent shadow-md`
                    : 'bg-transparent border-transparent text-slate-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Master Transaksi</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${masterTransaksiOpen ? 'rotate-90' : ''}`} />
              </button>

              {masterTransaksiOpen && (
                <div className="space-y-1 pl-2 border-l border-white/10 ml-2">
                  {masterTransaksiItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-semibold tracking-wide transition-all ${
                        activeMenu === item.id
                          ? `${currentTheme.activeBg} ${currentTheme.activeText} border-transparent`
                          : 'bg-transparent border-transparent text-slate-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{masterTransaksiShortLabel[item.id] || item.label.replace('Master Transaksi: ', '')}</span>
                      {activeMenu === item.id && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all border border-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
