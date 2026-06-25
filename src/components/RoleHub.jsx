import React from 'react';
import { useDb } from '../context/DbContext';
import { Shield, Database, Wrench, Home, Briefcase, ChevronRight } from 'lucide-react';

export default function RoleHub({ onViewDashboard }) {
  const { changeRole, currentUser } = useDb();

  const roles = [
    {
      id: 'administrator',
      title: 'ADMINISTRATOR',
      color: 'from-slate-500 to-slate-700 shadow-slate-500/20 border-slate-400',
      textColor: 'text-slate-200',
      badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: Shield,
      summary: [
        'Master Data User & Role',
        'Master Data Fasilitas Wilayah',
        'Data Wilayah (Provinsi - Kelurahan)',
        'Setup Parameter Kuisioner',
        'Manajemen Bidang Perawatan'
      ],
      positionClass: 'lg:top-12 lg:left-12'
    },
    {
      id: 'entry_data',
      title: 'ADMIN DINAS / ENTRY DATA',
      color: 'from-orange-500 to-orange-700 shadow-orange-500/20 border-orange-400',
      textColor: 'text-orange-200',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      icon: Database,
      summary: [
        'Setup Rusun, Blok, & Unit',
        'Data Master Vendor & Material',
        'Registrasi Rusunawa & Rusunami',
        'Input Tagihan & Hasil Kuesioner',
        'Penyerahan BTPP Rusunami'
      ],
      positionClass: 'lg:top-12 lg:right-12'
    },
    {
      id: 'uprs_perawatan',
      title: 'UPRS & BIDANG PERAWATAN',
      color: 'from-purple-500 to-purple-700 shadow-purple-500/20 border-purple-400',
      textColor: 'text-purple-200',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: Wrench,
      summary: [
        'Kontrak Kerja Vendor Perawatan',
        'Jadwal Rutin Inspeksi Lapangan',
        'Tindak Lanjut Laporan Pengaduan',
        'Undian & Setup Penghuni Hasil Lotere',
        'Data Tunggakan & Penutupan Sewa'
      ],
      positionClass: 'lg:bottom-12 lg:right-12'
    },
    {
      id: 'penghuni',
      title: 'PENGHUNI RUSUN',
      color: 'from-rose-500 to-rose-700 shadow-rose-500/20 border-rose-400',
      textColor: 'text-rose-200',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: Home,
      summary: [
        'Booking & Pendaftaran Online',
        'Informasi Tagihan & Bayar Sewa',
        'Pengajuan Sertifikat BTPP',
        'Laporan Pengaduan & Kerusakan',
        'Pengisian Kuesioner Evaluasi'
      ],
      positionClass: 'lg:bottom-12 lg:left-12'
    },
    {
      id: 'pimpinan_dinas',
      title: 'PIMPINAN DINAS / PEJABAT',
      color: 'from-emerald-500 to-emerald-700 shadow-emerald-500/20 border-emerald-400',
      textColor: 'text-emerald-200',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Briefcase,
      summary: [
        'Dashboard & Visualisasi Laporan',
        'Analisis Target & Realisasi Pendapatan',
        'Persetujuan (Approval) Sewa & BTPP',
        'Persetujuan Penutupan Kontrak Sewa',
        'Persetujuan Penugasan Input Data'
      ],
      positionClass: 'lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2'
    }
  ];

  const handleRoleSelect = (roleId) => {
    changeRole(roleId);
    onViewDashboard(roleId);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-900 overflow-hidden flex flex-col justify-between py-12 px-4 select-none">
      {/* Dynamic Background Network Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
      
      {/* Futuristic glowing particles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      {/* Header */}
      <div className="relative text-center z-10 max-w-3xl mx-auto">
        <div className="inline-block px-3 py-1 mb-3 rounded-full border border-blue-500/30 bg-blue-500/5 text-xs font-semibold text-blue-400 uppercase tracking-widest animate-pulse">
          Sistem Portal Terintegrasi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-100 to-slate-200 tracking-tight">
          SIRUKIM DKI JAKARTA
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Sistem Informasi Rumah Susun Sederhana Sewa (Rusunawa) & Milik (Rusunami) Dinas Perumahan Rakyat & Kawasan Pemukiman.
        </p>
      </div>

      {/* Interactive Architecture Hub Map */}
      <div className="relative flex-grow flex items-center justify-center my-12 lg:my-0">
        
        {/* SVG Connection Lines - Only visible on desktop/large screens */}
        <svg className="absolute inset-0 w-full h-full hidden lg:block pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-admin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6b7280" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-dinas" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-uprs" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-penghuni" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-pimpinan" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Connection Lines from Roles to Center */}
          {/* Admin Line */}
          <path d="M 220 180 Q 350 250 420 280" fill="none" stroke="url(#grad-admin)" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />
          {/* Dinas Line */}
          <path d="M 780 180 Q 650 250 580 280" fill="none" stroke="url(#grad-dinas)" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />
          {/* Uprs Line */}
          <path d="M 780 500 Q 650 430 580 380" fill="none" stroke="url(#grad-uprs)" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />
          {/* Penghuni Line */}
          <path d="M 220 500 Q 350 430 420 380" fill="none" stroke="url(#grad-penghuni)" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />
          {/* Pimpinan Line */}
          <path d="M 500 520 L 500 400" fill="none" stroke="url(#grad-pimpinan)" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />
        </svg>

        {/* Center Node (Sistem Informasi Rusun) */}
        <div className="relative z-10 w-72 h-72 rounded-full bg-slate-900 border-4 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col justify-center items-center text-center p-6 select-none transition-all duration-500 hover:scale-105 float-animation">
          <div className="absolute inset-2 rounded-full border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
              <Database className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-extrabold mb-1">Pusat Data Integrasi</span>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide leading-snug max-w-[200px]">
              SISTEM INFORMASI RUSUN
            </h2>
            <p className="text-[9px] text-slate-400 mt-2 font-medium max-w-[170px] uppercase">
              Dinas Perumahan Rakyat & Kawasan Pemukiman
            </p>
          </div>
        </div>

        {/* Outer Role Nodes */}
        <div className="absolute w-full h-full inset-0 flex flex-col lg:block justify-center items-center gap-6 z-10">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`lg:absolute ${role.positionClass} group cursor-pointer w-full max-w-[340px] bg-slate-900/95 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-slate-800/80`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon Block */}
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color} border shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Role Detail */}
                  <div className="flex-grow">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wider mb-2 uppercase ${role.badgeBg}`}>
                      Role Access
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase group-hover:text-blue-400 transition-colors">
                      {role.title}
                    </h3>
                    
                    {/* Hover items / Description preview */}
                    <ul className="mt-3 space-y-1 text-slate-400 text-xs hidden sm:block">
                      {role.summary.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 truncate">
                          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                      {role.summary.length > 3 && (
                        <li className="text-[10px] text-blue-400 font-semibold mt-1 flex items-center gap-0.5">
                          <span>Lihat selengkapnya</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center z-10 text-xs text-slate-500 mt-6 max-w-xl mx-auto leading-normal">
        <p className="font-semibold text-slate-400">© 2026 Pemerintah Provinsi DKI Jakarta</p>
        <p className="mt-1">Hak Cipta Dilindungi Undang-Undang. Menggunakan React.js & Tailwind CSS dengan arsitektur multi-role terintegrasi.</p>
      </div>
    </div>
  );
}
