import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateMyProfile } = useDb();
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    updateMyProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password
    });

    setForm((prev) => ({ ...prev, password: '' }));
    setMessage('Profil berhasil diperbarui.');
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Edit Profil</h3>
        <p className="text-xs text-slate-400 mt-1">Perbarui data profil akun aktif Anda.</p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 px-3 py-2 text-xs font-semibold">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Nama</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="glass-input pl-10 text-xs w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="glass-input pl-10 text-xs w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Password Baru (Opsional)</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Kosongkan jika tidak ingin mengubah"
              className="glass-input pl-10 text-xs w-full"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-xs py-2.5">
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Profil</span>
        </button>
      </form>
    </div>
  );
}
