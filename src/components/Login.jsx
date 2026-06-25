import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Lock, User, Key, AlertCircle, UserPlus, Mail, Phone, CheckCircle2 } from 'lucide-react';
import logoDki from '../../logo/logo-dki.png';
import logoDprkp from '../../logo/logo-dprkp.png';
import logoApp from '../../logo/logo-app.png';

export default function Login({ onLoginSuccess }) {
  const { authenticateUser, registerResident } = useDb();
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setSuccess('');

    if (!username) {
      setError('Username atau Email wajib diisi.');
      return;
    }

    if (!password) {
      setError('Password wajib diisi.');
      return;
    }

    const result = await authenticateUser(username, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError('');
    onLoginSuccess(result.user);
  };

  const updateRegisterForm = (field, value) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!registerForm.name || !registerForm.username || !registerForm.email || !registerForm.phone || !registerForm.password) {
      setError('Semua field registrasi wajib diisi.');
      return;
    }

    if (registerForm.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    const result = await registerResident(registerForm);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setRegisterForm({
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setUsername(result.user.username);
    setPassword('');
    setSuccess('Registrasi penghuni berhasil. Silakan login menggunakan akun yang baru dibuat.');
    setAuthMode('login');
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-hidden flex flex-col lg:flex-row justify-center items-center p-4">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#fa801d]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Left Column: Branding / Info */}
      <div className="relative z-10 w-full lg:w-1/2 p-6 lg:p-12 text-center lg:text-left flex flex-col justify-center">
        <span className="inline-block px-3 py-1 mb-4 rounded-full border border-[#fa801d]/30 bg-[#fa801d]/10 text-xs font-semibold text-[#fa801d] uppercase tracking-widest self-center lg:self-start">
          Sistem Portal Terpadu
        </span>
        <div className="mt-4 flex flex-row items-center gap-6 max-w-xl mx-auto lg:mx-0">
          <img
            src={logoDki}
            alt="Logo DKI Jakarta"
            className="w-24 sm:w-28 lg:w-32 h-auto object-contain"
          />
          <img
            src={logoDprkp}
            alt="Logo DPRKP"
            className="w-24 sm:w-28 lg:w-32 h-auto object-contain"
          />
        </div>
        <h1 className="mt-6 text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-[#fa801d] to-slate-200 tracking-tight leading-tight">
          SIRUKIM DKI JAKARTA
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
          Sistem Informasi Perumahan dan Permukiman DKI JAKARTA
        </p>
        
        {/* Short bullet feature list */}
        <div className="hidden lg:grid grid-cols-2 gap-4 mt-6 max-w-md">
          {[
            { t: 'Multi-Role Portal', d: 'Satu akses pintu masuk website untuk warga, dinas, UPRS, dan eksekutif.' },
            { t: 'Sinkronisasi Real-Time', d: 'Persetujuan data sewa, tunggakan, dan perbaikan secara real-time.' }
          ].map((item, idx) => (
            <div key={idx} className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">{item.t}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Glassmorphic Login Form */}
      <div className="relative z-10 w-full lg:w-1/2 max-w-[480px] p-6 sm:p-8 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col justify-center gap-6">
        <div>
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/60 p-1 text-[11px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
              className={`rounded-xl px-4 py-2 transition ${authMode === 'login' ? 'bg-[#fa801d] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccess(''); }}
              className={`rounded-xl px-4 py-2 transition ${authMode === 'register' ? 'bg-[#fa801d] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Register Penghuni
            </button>
          </div>
          <div className="flex justify-center my-4">
            <img
              src={logoApp}
              alt="Logo aplikasi"
              className="w-20 sm:w-20 lg:w-44 h-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase mt-4">
            {authMode === 'login' ? 'LOGIN PORTAL' : 'REGISTER PENGHUNI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'login'
              ? 'Silakan masuk menggunakan username/email dan password yang terdaftar pada data user.'
              : 'Pendaftaran mandiri hanya tersedia untuk role Penghuni Rusun.'}
          </p>
        </div>

        {error && (
          <div className="flex gap-2 p-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2 p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Username / Email</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); setSuccess(''); }}
                  placeholder="Masukkan username atau email"
                  className="glass-input pl-10 text-xs w-full" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); setSuccess(''); }}
                  placeholder="••••••••" 
                  className="glass-input pl-10 text-xs w-full" 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-[#fa801d] hover:bg-[#e86f0f] text-xs py-3 mt-2 shadow-lg shadow-[#fa801d]/20">
              <Key className="w-4 h-4" />
              <span>Autentikasi Akun</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={e => updateRegisterForm('name', e.target.value)}
                    placeholder="Nama penghuni"
                    className="glass-input pl-10 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Username</label>
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={e => updateRegisterForm('username', e.target.value)}
                    placeholder="username baru"
                    className="glass-input pl-10 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">No. Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={registerForm.phone}
                    onChange={e => updateRegisterForm('phone', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="glass-input pl-10 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={e => updateRegisterForm('email', e.target.value)}
                    placeholder="nama@email.com"
                    className="glass-input pl-10 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={e => updateRegisterForm('password', e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="glass-input pl-10 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={e => updateRegisterForm('confirmPassword', e.target.value)}
                    placeholder="Ulangi password"
                    className="glass-input pl-10 text-xs w-full"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#fa801d]/20 bg-[#fa801d]/10 p-3 text-[11px] text-orange-100">
              Akun yang dibuat dari form ini otomatis terdaftar sebagai <span className="font-bold">Penghuni Rusun</span>.
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-[#fa801d] hover:bg-[#e86f0f] text-xs py-3 mt-2 shadow-lg shadow-[#fa801d]/20">
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Akun Penghuni</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
