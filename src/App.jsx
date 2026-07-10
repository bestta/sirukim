import React, { useEffect, useRef, useState } from 'react';
import { DbProvider, useDb } from './context/DbContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Administrator from './views/Administrator';
import AdminDinas from './views/AdminDinas';
import UprsPerawatan from './views/UprsPerawatan';
import PenghuniRusun from './views/PenghuniRusun';
import PimpinanDinas from './views/PimpinanDinas';
import ProfilePage from './views/ProfilePage';
import GeminiChatWidget from './components/GeminiChatWidget';
import logoApp from '../logo/logo-app.png';

function MainApp() {
  const { currentUser, setCurrentUserById, logoutUser } = useDb();

  const SESSION_KEY = 'sirukim_auth_session';
  const SESSION_USER_KEY = 'sirukim_session_user_id';
  const MAX_IDLE_MS = 60 * 60 * 1000;
  
  // Navigation states
  const [viewMode, setViewMode] = useState('login');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const lastActivityRef = useRef(Date.now());

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  };

  const writeSession = (userId, timestamp = Date.now()) => {
    if (!userId) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, lastActivity: timestamp }));
    localStorage.setItem(SESSION_USER_KEY, userId);
    lastActivityRef.current = timestamp;
  };

  const handleLoginSuccess = (user) => {
    setViewMode('dashboard');
    setActiveMenu('dashboard');
    writeSession(user?.id);
  };

  const handleLogout = () => {
    clearSession();
    logoutUser();
    setViewMode('login');
  };

  useEffect(() => {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) return;

    try {
      const parsed = JSON.parse(rawSession);
      const idleTime = Date.now() - Number(parsed?.lastActivity || 0);

      if (!parsed?.userId || idleTime > MAX_IDLE_MS) {
        clearSession();
        logoutUser();
        setViewMode('login');
        return;
      }

      setCurrentUserById(parsed.userId);
      setViewMode('dashboard');
      lastActivityRef.current = Number(parsed.lastActivity);
    } catch {
      clearSession();
    }
  }, [setCurrentUserById, logoutUser]);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsBooting(false), 1200);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (viewMode !== 'dashboard' || !currentUser?.id) return;

    const touchActivity = () => {
      const now = Date.now();
      writeSession(currentUser.id, now);
    };

    const checkIdle = () => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= MAX_IDLE_MS) {
        handleLogout();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, touchActivity));

    const intervalId = window.setInterval(checkIdle, 60 * 1000);
    touchActivity();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, touchActivity));
      window.clearInterval(intervalId);
    };
  }, [viewMode, currentUser?.id]);

  // Switch pages based on role and active menu
  const renderViewContent = () => {
    if (activeMenu === 'profile') {
      return <ProfilePage />;
    }

    switch (currentUser?.role) {
      case 'administrator':
        return <Administrator activeMenu={activeMenu} />;
      case 'entry_data':
        return <AdminDinas activeMenu={activeMenu} />;
      case 'uprs_perawatan':
        return <UprsPerawatan activeMenu={activeMenu} />;
      case 'penghuni':
        return <PenghuniRusun activeMenu={activeMenu} setActiveMenu={setActiveMenu} />;
      case 'pimpinan_dinas':
        return <PimpinanDinas activeMenu={activeMenu} />;
      default:
        return <div className="p-6 text-slate-400 italic">Peran tidak dikenali. Silakan hubungi admin.</div>;
    }
  };

  // Convert menu ID to readable page title
  const getPageTitle = () => {
    const titleMap = {
      dashboard: 'Dashboard Utama',
      roles: 'Hak Akses User & Role',
      users: 'Manajemen Akun User',
      profile: 'Edit Profil',
      facilities: 'Fasilitas Wilayah',
      regions: 'Master Data Wilayah',
      maintenance_depts: 'Daftar Bidang Perawatan',
      questionnaire_setup: 'Konfigurasi Kuisioner Warga',
      rusun_setup: 'Setup Struktur Rumah Susun',
      tower_setup: 'Setup Blok & Tower Hunian',
      unit_setup: 'Setup Kamar & Unit Hunian',
      vendors: 'Data Master Vendor Perawatan',
      material_builders: 'Stok Material Konstruksi',
      bookings: 'Daftar Booking Online Masuk',
      registrations: 'Data Registrasi Rusunawa',
      btpp_handover: 'Penyerahan Sertifikat BTPP',
      billing_invoices: 'Audit Tagihan Sewa bulanan',
      survey_results: 'Akumulasi Hasil Kuesioner',
      vendor_contracts: 'Kontrak Kerja Perawatan',
      maintenance_schedule: 'Jadwal Rutin Pemeliharaan',
      tenant_lottery: 'Undian & Lotere Penghuni',
      field_inspections: 'Catatan Temuan Lapangan',
      tenant_arrears: 'Data Tunggakan Warga',
      lease_closures: 'Pemutusan Kontrak Sewa',
      apply_booking: 'Pendaftaran Unit Baru',
      my_bills: 'Pembayaran Rekening Sewa',
      btpp_request: 'Permohonan Sertifikat BTPP',
      submit_complaint: 'Formulir Pengaduan Warga',
      fill_survey: 'Kuesioner Kepuasan Layanan',
      financial_revenue: 'Target vs Realisasi Keuangan',
      approvals_inbox: 'Kotak Masuk Persetujuan',
      analytical_reports: 'Ekspor Laporan PDF/Cetak',
      master_transaksi_pendaftaran: 'Master Transaksi - Pendaftaran Sewa Rusun',
      master_transaksi_pemeriksaan: 'Master Transaksi - Pemeriksaan Berkas',
      master_transaksi_persetujuan: 'Master Transaksi - Persetujuan Pendaftaran',
      master_transaksi_daftar_ulang: 'Master Transaksi - Pendaftaran Ulang Sewa Rusun',
      master_transaksi_serah_terima: 'Master Transaksi - Serah Terima Kunci'
    };
    return titleMap[activeMenu] || 'Detail Menu';
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-5 animate-pulse">
          <img src={logoApp} alt="Logo aplikasi" className="w-24 sm:w-28 lg:w-32 h-auto object-contain drop-shadow-2xl" />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#fa801d]">SIRUKIM</p>
            <p className="mt-1 text-xs text-slate-400">Memuat halaman...</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'login' || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Choose container class matching current role theme
  const getContainerTheme = () => {
    switch (currentUser?.role) {
      case 'administrator': return 'border-slate-800 bg-slate-900/10';
      case 'entry_data': return 'border-orange-500/20 bg-orange-950/5';
      case 'uprs_perawatan': return 'border-purple-500/20 bg-purple-950/5';
      case 'penghuni': return 'border-orange-500/20 bg-orange-950/5';
      case 'pimpinan_dinas': return 'border-emerald-500/20 bg-emerald-950/5';
      default: return 'border-slate-800 bg-slate-900/10';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Responsive Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto lg:pl-72 transition-all">
        
        {/* Dynamic header */}
        <Header 
          setSidebarOpen={setSidebarOpen} 
          setActiveMenu={setActiveMenu}
          activeMenuTitle={getPageTitle()} 
        />

        {/* View Content Body wrapped in a beautiful design system grid */}
        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <div className={`border rounded-3xl p-6 shadow-sm min-h-[80vh] ${getContainerTheme()} transition-colors duration-300`}>
            {renderViewContent()}
          </div>
        </main>
      </div>

      <GeminiChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <DbProvider>
      <MainApp />
    </DbProvider>
  );
}
