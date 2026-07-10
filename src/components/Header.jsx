import React, { useEffect, useMemo, useState } from 'react';
import { useDb } from '../context/DbContext';
import { Bell, Sun, Moon, CheckCircle } from 'lucide-react';

export default function Header({ 
  setSidebarOpen, 
  setActiveMenu,
  activeMenuTitle 
}) {
  const { currentUser, bookings, complaints, tagihan, sewaTransactions } = useDb();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);

  const dismissedNotifKey = useMemo(
    () => currentUser?.id ? `sirukim_notif_dismissed_${currentUser.id}` : '',
    [currentUser?.id]
  );

  useEffect(() => {
    if (!dismissedNotifKey) {
      setDismissedNotifIds([]);
      return;
    }

    try {
      const raw = localStorage.getItem(dismissedNotifKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setDismissedNotifIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setDismissedNotifIds([]);
    }
  }, [dismissedNotifKey]);

  const persistDismissedNotif = (updater) => {
    setDismissedNotifIds((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (dismissedNotifKey) {
        localStorage.setItem(dismissedNotifKey, JSON.stringify(next));
      }
      return next;
    });
  };

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

    // Add pending work orders for UPRS
    if (currentUser?.role === 'uprs_perawatan') {
      const cCount = complaints.filter(c => c.status === 'submitted').length;
      if (cCount > 0) list.push({ id: `uprs-complaint-${cCount}`, text: `${cCount} Pengaduan baru dari Penghuni`, type: 'complaint', targetMenu: 'field_inspections' });
    }

    if (currentUser?.role === 'administrator') {
      const pendingAccountChecks = sewaTransactions.filter((item) => item.verificationStatus === 'pending').length;
      if (pendingAccountChecks > 0) {
        list.push({ id: `admin-pending-check-${pendingAccountChecks}`, text: `${pendingAccountChecks} pendaftaran sewa menunggu pemeriksaan berkas`, type: 'approval', targetMenu: 'master_transaksi_pemeriksaan' });
      }
    }

    if (currentUser?.role === 'entry_data') {
      const pendingChecks = sewaTransactions.filter((item) => item.verificationStatus === 'pending').length;
      const pendingSchedules = sewaTransactions.filter((item) => !item.verificationScheduleAt).length;

      if (pendingChecks > 0) {
        list.push({ id: `entry-pending-check-${pendingChecks}`, text: `${pendingChecks} berkas pendaftaran menunggu proses pemeriksaan`, type: 'approval', targetMenu: 'master_transaksi_pemeriksaan' });
      }

      if (pendingSchedules > 0) {
        list.push({ id: `entry-pending-schedule-${pendingSchedules}`, text: `${pendingSchedules} pendaftar belum dijadwalkan undangan verifikasi`, type: 'approval', targetMenu: 'master_transaksi_pendaftaran' });
      }
    }

    // Add unpaid rent for Penghuni
    if (currentUser?.role === 'penghuni') {
      const myBills = tagihan.filter((item) => item.tenantName === currentUser?.name);
      const unpaidCount = myBills.filter((item) => item.status === 'unpaid' || item.status === 'overdue').length;
      if (unpaidCount > 0) {
        list.push({ id: `penghuni-bill-${unpaidCount}`, text: `Anda memiliki ${unpaidCount} tagihan sewa belum lunas`, type: 'billing', targetMenu: 'my_bills' });
      }

      const mySewa = sewaTransactions.filter((item) => (
        item.applicantUserId === currentUser?.id ||
        item.applicantEmail === currentUser?.email ||
        item.applicantName === currentUser?.name
      ));

      const inviteCount = mySewa.filter((item) => item.verificationScheduleAt).length;
      const pendingCount = mySewa.filter((item) => item.approvalStatus === 'pending').length;
      const decidedCount = mySewa.filter((item) => item.approvalStatus !== 'pending').length;

      if (inviteCount > 0) {
        list.push({ id: `penghuni-invite-${inviteCount}`, text: `${inviteCount} undangan verifikasi berkas sewa rusun tersedia`, type: 'approval', targetMenu: 'master_transaksi_pendaftaran' });
      }

      if (pendingCount > 0) {
        list.push({ id: `penghuni-pending-${pendingCount}`, text: `${pendingCount} pendaftaran sewa Anda sedang diproses`, type: 'approval', targetMenu: 'master_transaksi_persetujuan' });
      }

      if (decidedCount > 0) {
        list.push({ id: `penghuni-decided-${decidedCount}`, text: `${decidedCount} status persetujuan pendaftaran telah diperbarui`, type: 'approval', targetMenu: 'master_transaksi_persetujuan' });
      }
    }

    if (currentUser?.role === 'pimpinan_dinas') {
      const pendingApproval = sewaTransactions.filter((item) => item.verificationStatus !== 'pending' && item.approvalStatus === 'pending').length;
      const pendingBookingApproval = bookings.filter((item) => item.status === 'pending_approval').length;

      if (pendingApproval > 0) {
        list.push({ id: `lead-pending-approval-${pendingApproval}`, text: `${pendingApproval} pendaftaran sewa menunggu persetujuan pimpinan`, type: 'approval', targetMenu: 'master_transaksi_persetujuan' });
      }

      if (pendingBookingApproval > 0) {
        list.push({ id: `lead-booking-approval-${pendingBookingApproval}`, text: `${pendingBookingApproval} booking unit menunggu keputusan pimpinan`, type: 'approval', targetMenu: 'approvals_inbox' });
      }
    }

    // Default system welcome
    if (list.length === 0) {
      list.push({ id: 'system-info-normal', text: 'Sistem SIRUKIM berjalan normal. Tidak ada notifikasi tertunda.', type: 'info' });
    }
    return list;
  };

  const rawNotifications = getNotifications();
  const notifications = currentUser?.role === 'penghuni'
    ? rawNotifications.filter((item) => !dismissedNotifIds.includes(item.id))
    : rawNotifications;

  useEffect(() => {
    if (currentUser?.role !== 'penghuni') return;

    const activeIds = new Set(rawNotifications.map((item) => item.id));
    persistDismissedNotif((prev) => prev.filter((id) => activeIds.has(id)));
  }, [currentUser?.role, rawNotifications.length]);

  const handleNotificationClick = (notification) => {
    if (currentUser?.role === 'penghuni' && notification?.id) {
      persistDismissedNotif((prev) => prev.includes(notification.id) ? prev : [...prev, notification.id]);
    }

    if (!notification?.targetMenu || typeof setActiveMenu !== 'function') return;
    setActiveMenu(notification.targetMenu);
    setNotifMenuOpen(false);
  };

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
            {notifications.some((item) => item.type !== 'info') && (
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
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left rounded-lg p-1.5 transition ${n.targetMenu ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'cursor-default'}`}
                    >
                      <div className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{n.text}</span>
                      </div>
                    </button>
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
