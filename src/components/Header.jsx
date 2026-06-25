import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Bell, Sun, Moon, CheckCircle } from 'lucide-react';

export default function Header({ 
  setSidebarOpen, 
  activeMenuTitle 
}) {
  const { currentUser, bookings, complaints, tagihan } = useDb();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const getRoleTheme = (role) => {
    switch (role) {
      case 'administrator':
        return { text: 'text-slate-400', name: 'Administrator' };
      case 'entry_data':
        return { text: 'text-orange-500', name: 'Admin Dinas' };
      case 'uprs_perawatan':
        return { text: 'text-purple-500', name: 'UPRS Perawatan' };
      case 'penghuni':
        return { text: 'text-orange-500', name: 'Penghuni Rusun' };
      case 'pimpinan_dinas':
        return { text: 'text-emerald-500', name: 'Pimpinan Dinas' };
      default:
        return { text: 'text-slate-400', name: 'Admin' };
    }
  };

  const activeTheme = getRoleTheme(currentUser?.role);

  // Compile notification logs
  const getNotifications = () => {
    const list = [];
    // Add pending approvals for Pimpinan
    if (currentUser?.role === 'pimpinan_dinas') {
      const pCount = bookings.filter(b => b.status === 'pending_approval').length;
      if (pCount > 0) list.push({ text: `${pCount} Permohonan Booking menunggu approval`, type: 'approval' });
    }
    // Add pending work orders for UPRS
    if (currentUser?.role === 'uprs_perawatan') {
      const cCount = complaints.filter(c => c.status === 'submitted').length;
      if (cCount > 0) list.push({ text: `${cCount} Pengaduan baru dari Penghuni`, type: 'complaint' });
    }
    // Add unpaid rent for Penghuni
    if (currentUser?.role === 'penghuni') {
      const uCount = tagihan.filter(t => t.status === 'unpaid').length;
      if (uCount > 0) list.push({ text: `Anda memiliki ${uCount} tagihan sewa yang belum dibayar`, type: 'billing' });
    }
    // Default system welcome
    if (list.length === 0) {
      list.push({ text: 'Sistem SIRUKIM berjalan normal. Tidak ada notifikasi tertunda.', type: 'info' });
    }
    return list;
  };

  const notifications = getNotifications();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      
      {/* Sidebar trigger / Mobile Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* View title */}
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
            {activeMenuTitle}
          </h1>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 inline-block">
            Dashboard Integrasi
          </span>
        </div>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className={activeTheme.text}>Role: {activeTheme.name}</span>
        </div>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && notifications[0].type !== 'info' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {notifMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-20 py-3 px-4 z-20 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Notifikasi Sistem
                </h4>
                <div className="space-y-3">
                  {notifications.map((n, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
