import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Shield, Plus, Trash2, Edit2, Users, MapPin, ToggleLeft, ToggleRight, LayoutGrid, CheckCircle } from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 5;

const paginateItems = (items, page) => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

export default function Administrator({ activeMenu }) {
  const { 
    users, addUser, deleteUser, updateUser,
    metadata, addMetadataItem, deleteMetadataItem,
    surveys, addQuestionnaire, toggleSurveyActive,
    activityLogs
  } = useDb();

  const [userForm, setUserForm] = useState({ username: '', name: '', role: 'penghuni', email: '', password: '' });
  const [regionForm, setRegionForm] = useState({ type: 'kelurahan', name: '', parentId: '' });
  const [facilityForm, setFacilityForm] = useState({ name: '', category: 'Umum' });
  const [surveyForm, setSurveyForm] = useState({ title: '', description: '', questions: ['', ''] });
  const [rolesPage, setRolesPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [facilitiesPage, setFacilitiesPage] = useState(1);
  const [surveysPage, setSurveysPage] = useState(1);

  const roleRows = [
    { r: 'administrator', desc: 'Hak penuh manajemen user, region kelurahan/kecamatan, fasilitas, dan survey kuesioner.', secure: 'Sangat Aman' },
    { r: 'entry_data', desc: 'Penginputan data rusunawa/rusunami, blok, unit, vendor dinas, serta verifikasi berkas pendaftaran.', secure: 'Menengah' },
    { r: 'uprs_perawatan', desc: 'Pengecekan kerusakan fisik, pencatatan inspeksi rutin, manajemen kontrak vendor, dan pengundian unit.', secure: 'Menengah' },
    { r: 'penghuni', desc: 'Akses warga: booking online, pengisian data pendaftaran ulang, pembayaran sewa, dan pengaduan keluhan.', secure: 'Aman' },
    { r: 'pimpinan_dinas', desc: 'Akses pelaporan eksekutif, rekapitulasi target pendapatan, dan pemberi persetujuan (approval) utama.', secure: 'Sangat Aman' }
  ];

  const parentOptions = {
    provinsi: [],
    kota: metadata.provinsi,
    kecamatan: metadata.kota,
    kelurahan: metadata.kecamatan
  };

  const parentLabel = {
    kota: 'Provinsi',
    kecamatan: 'Kota / Kabupaten',
    kelurahan: 'Kecamatan'
  };

  const handleEditUser = (user) => {
    const name = window.prompt('Ubah nama user:', user.name);
    if (name === null) return;
    const email = window.prompt('Ubah email user:', user.email);
    if (email === null) return;
    const password = window.prompt('Ubah password (kosongkan untuk tidak mengubah):', '');
    if (password === null) return;

    updateUser(user.id, {
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      ...(password.trim() ? { password: password.trim() } : {})
    });
  };

  // Handle User Submit
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.name || !userForm.email || !userForm.password) return;
    addUser(userForm);
    setUserForm({ username: '', name: '', role: 'penghuni', email: '', password: '' });
  };

  // Handle Region Submit
  const handleRegionSubmit = (e) => {
    e.preventDefault();
    if (!regionForm.name) return;
    if (regionForm.type !== 'provinsi' && !regionForm.parentId) return;
    addMetadataItem(regionForm.type, { name: regionForm.name, parentId: regionForm.parentId });
    setRegionForm({ type: 'kelurahan', name: '', parentId: '' });
  };

  // Handle Facility Submit
  const handleFacilitySubmit = (e) => {
    e.preventDefault();
    if (!facilityForm.name) return;
    addMetadataItem('fasilitas', { name: facilityForm.name, category: facilityForm.category });
    setFacilityForm({ name: '', category: 'Umum' });
  };

  // Handle Survey Submit
  const handleSurveySubmit = (e) => {
    e.preventDefault();
    if (!surveyForm.title) return;
    const formattedQs = surveyForm.questions
      .filter(q => q.trim() !== '')
      .map((text, idx) => ({ id: `q-${idx + 1}`, text, type: 'scale' }));
    addQuestionnaire(surveyForm.title, surveyForm.description, formattedQs);
    setSurveyForm({ title: '', description: '', questions: ['', ''] });
  };

  // --- STATS OVERVIEW ---
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-slate-500">
            <div className="p-3 bg-slate-500/10 text-slate-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Total User Terdaftar</span>
              <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-blue-500">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Wilayah Terdata</span>
              <h3 className="text-2xl font-bold mt-1">
                {metadata.provinsi.length + metadata.kota.length + metadata.kecamatan.length + metadata.kelurahan.length}
              </h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-orange-500">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Fasilitas Master</span>
              <h3 className="text-2xl font-bold mt-1">{metadata.fasilitas.length}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-emerald-500">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Kuesioner Aktif</span>
              <h3 className="text-2xl font-bold mt-1">{surveys.filter(s => s.active).length}</h3>
            </div>
          </div>
        </div>

        {/* Activity log summary */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
            Aktivitas Administrator Terakhir
          </h3>
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === 'admin' ? 'bg-blue-400' : item.type === 'entry' ? 'bg-orange-400' : item.type === 'uprs' ? 'bg-purple-400' : 'bg-slate-400'}`}></span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                  <p className="text-slate-400 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="text-xs text-slate-400 italic">Belum ada aktivitas terbaru.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- USER GROUPS / ROLES MANAGEMENT ---
  if (activeMenu === 'roles') {
    const pagedRoleRows = paginateItems(roleRows, rolesPage);
    const totalRolePages = Math.max(1, Math.ceil(roleRows.length / PAGE_SIZE));

    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Manajemen Hak Akses & Grup User
          </h3>
          <p className="text-xs text-slate-400 mt-1">Konfigurasi hak akses aplikasi SIRUKIM per kategori grup user.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Nama Role</th>
                <th className="py-3 px-4 font-semibold">Deskripsi Otoritas</th>
                <th className="py-3 px-4 font-semibold">Jumlah User</th>
                <th className="py-3 px-4 font-semibold">Status Keamanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pagedRoleRows.map((roleRow, idx) => {
                const count = users.filter(u => u.role === roleRow.r).length;
                return (
                  <tr key={idx} className="hover:bg-slate-500/5 transition">
                    <td className="py-3.5 px-4 font-bold uppercase text-slate-700 dark:text-slate-300">{roleRow.r.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-sm leading-relaxed">{roleRow.desc}</td>
                    <td className="py-3.5 px-4 font-semibold">{count} User</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-bold">
                        {roleRow.secure}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={rolesPage} totalPages={totalRolePages} onPageChange={setRolesPage} />
        </div>
      </div>
    );
  }

  // --- USER ACCOUNTS MANAGEMENT ---
  if (activeMenu === 'users') {
    const pagedUsers = paginateItems(users, usersPage);
    const totalUserPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Registration Form */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Registrasi User Baru
          </h3>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Username</label>
              <input 
                type="text" 
                value={userForm.username}
                onChange={e => setUserForm({...userForm, username: e.target.value})}
                placeholder="cth: budi_rusun" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
              <input 
                type="text" 
                value={userForm.name}
                onChange={e => setUserForm({...userForm, name: e.target.value})}
                placeholder="cth: Budi Santoso" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
              <input 
                type="email" 
                value={userForm.email}
                onChange={e => setUserForm({...userForm, email: e.target.value})}
                placeholder="cth: budi@gmail.com" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Role Aplikasi</label>
              <select 
                value={userForm.role}
                onChange={e => setUserForm({...userForm, role: e.target.value})}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="administrator">Administrator</option>
                <option value="entry_data">Admin Dinas / Entry Data</option>
                <option value="uprs_perawatan">UPRS & Perawatan</option>
                <option value="penghuni">Penghuni Rusun</option>
                <option value="pimpinan_dinas">Pimpinan Dinas</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <input
                type="password"
                value={userForm.password}
                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Masukkan password user"
                className="glass-input text-xs"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan User</span>
            </button>
          </form>
        </div>

        {/* User Account Registry Table */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Akun Terdaftar
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-500/5">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-blue-500">{u.role.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => updateUser(u.id, { active: !u.active })}>
                        {u.active ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-medium">
                            <ToggleRight className="w-6 h-6" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <ToggleLeft className="w-6 h-6" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="p-1 mr-2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={usersPage} totalPages={totalUserPages} onPageChange={setUsersPage} />
          </div>
        </div>
      </div>
    );
  }

  // --- REGIONS / GEOGRAPHIC METADATA ---
  if (activeMenu === 'regions') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Location Form */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tambah Wilayah Administratif
          </h3>
          <form onSubmit={handleRegionSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Wilayah</label>
              <select 
                value={regionForm.type}
                onChange={e => setRegionForm({...regionForm, type: e.target.value, parentId: ''})}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="provinsi">Provinsi</option>
                <option value="kota">Kota / Kabupaten</option>
                <option value="kecamatan">Kecamatan</option>
                <option value="kelurahan">Kelurahan</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Wilayah</label>
              <input 
                type="text" 
                value={regionForm.name}
                onChange={e => setRegionForm({...regionForm, name: e.target.value})}
                placeholder="cth: Kelurahan Marunda" 
                className="glass-input text-xs" 
              />
            </div>
            {regionForm.type !== 'provinsi' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{parentLabel[regionForm.type]}</label>
                <select
                  value={regionForm.parentId}
                  onChange={(e) => setRegionForm({ ...regionForm, parentId: e.target.value })}
                  className="glass-input text-xs bg-white dark:bg-slate-900"
                >
                  <option value="">-- Pilih {parentLabel[regionForm.type]} --</option>
                  {parentOptions[regionForm.type].map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Wilayah</span>
            </button>
          </form>
        </div>

        {/* Location Lists */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Daftar Wilayah SIRUKIM
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['provinsi', 'kota', 'kecamatan', 'kelurahan'].map((type) => (
              <div key={type} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">{type}</span>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                  {metadata[type]?.map((item) => (
                    <li key={item.id} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <button 
                        onClick={() => deleteMetadataItem(type, item.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                  {(!metadata[type] || metadata[type].length === 0) && (
                    <li className="py-2 text-slate-400 italic">Belum ada data.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- FACILITIES MASTER DATA ---
  if (activeMenu === 'facilities') {
    const pagedFacilities = paginateItems(metadata.fasilitas || [], facilitiesPage);
    const totalFacilityPages = Math.max(1, Math.ceil((metadata.fasilitas || []).length / PAGE_SIZE));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Facility Form */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tambah Fasilitas Rusun
          </h3>
          <form onSubmit={handleFacilitySubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Fasilitas</label>
              <input 
                type="text" 
                value={facilityForm.name}
                onChange={e => setFacilityForm({...facilityForm, name: e.target.value})}
                placeholder="cth: PAUD / Penitipan Anak" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
              <select 
                value={facilityForm.category}
                onChange={e => setFacilityForm({...facilityForm, category: e.target.value})}
                className="glass-input text-xs bg-white dark:bg-slate-900"
              >
                <option value="Umum">Umum</option>
                <option value="Ibadah">Ibadah</option>
                <option value="Sosial">Sosial</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Pendidikan">Pendidikan</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Simpan Fasilitas</span>
            </button>
          </form>
        </div>

        {/* Facilities Registry List */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Master Data Fasilitas Terdata
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Nama Fasilitas</th>
                  <th className="py-2.5 px-3 font-semibold">Kategori</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {pagedFacilities.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-500/5">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">{f.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                        {f.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => deleteMetadataItem('fasilitas', f.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={facilitiesPage} totalPages={totalFacilityPages} onPageChange={setFacilitiesPage} />
          </div>
        </div>
      </div>
    );
  }

  // --- SETUP MAINTENANCE DEPARTMENTS ---
  if (activeMenu === 'maintenance_depts') {
    return (
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Bidang Perawatan & Pemeliharaan Rusun
          </h3>
          <p className="text-xs text-slate-400 mt-1">Daftar penanggung jawab divisi pemeliharaan sarana dan prasarana rusunawa.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { dept: 'Divisi Kelistrikan & MEP', lead: 'Herman Susanto', staff: 6, status: 'Siaga' },
            { dept: 'Divisi Plumbing & Air Bersih', lead: 'Indra Hermawan', staff: 8, status: 'Siaga' },
            { dept: 'Divisi Struktur & Finishing', lead: 'Agus Priyono', staff: 4, status: 'Siaga' }
          ].map((div, idx) => (
            <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{div.dept}</h4>
              <div className="text-xs space-y-1.5 text-slate-400">
                <p>Kepala Bidang: <span className="font-bold text-slate-700 dark:text-slate-300">{div.lead}</span></p>
                <p>Jumlah Teknisi: <span className="font-semibold text-slate-700 dark:text-slate-300">{div.staff} Anggota</span></p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {div.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- SETUP QUESTIONNAIRES ---
  if (activeMenu === 'questionnaire_setup') {
    const pagedSurveys = paginateItems(surveys, surveysPage);
    const totalSurveyPages = Math.max(1, Math.ceil(surveys.length / PAGE_SIZE));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Survey Form */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Rilis Kuesioner Baru
          </h3>
          <form onSubmit={handleSurveySubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Kuesioner</label>
              <input 
                type="text" 
                value={surveyForm.title}
                onChange={e => setSurveyForm({...surveyForm, title: e.target.value})}
                placeholder="cth: Evaluasi Kebersihan Q2" 
                className="glass-input text-xs" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Ringkas</label>
              <textarea 
                value={surveyForm.description}
                onChange={e => setSurveyForm({...surveyForm, description: e.target.value})}
                placeholder="Berikan petunjuk pengisian..." 
                className="glass-input text-xs min-h-[70px] resize-none" 
              />
            </div>
            
            {/* Questions inputs list */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Pertanyaan (Skala 1-5)</label>
              {surveyForm.questions.map((q, idx) => (
                <input 
                  key={idx}
                  type="text" 
                  value={q}
                  onChange={e => {
                    const newQs = [...surveyForm.questions];
                    newQs[idx] = e.target.value;
                    setSurveyForm({...surveyForm, questions: newQs});
                  }}
                  placeholder={`Pertanyaan #${idx + 1}`} 
                  className="glass-input text-xs w-full" 
                />
              ))}
              <button 
                type="button"
                onClick={() => setSurveyForm({...surveyForm, questions: [...surveyForm.questions, '']})}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                + Tambah Pertanyaan
              </button>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-xs py-2.5">
              <Plus className="w-4 h-4" />
              <span>Daftarkan Kuesioner</span>
            </button>
          </form>
        </div>

        {/* Survey Questionnaires List */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Daftar Kuesioner Evaluasi
          </h3>
          <div className="space-y-4">
            {pagedSurveys.map((s) => (
              <div key={s.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-normal">{s.description}</p>
                  <div className="flex gap-4 text-[10px] text-slate-500 font-semibold mt-1">
                    <span>Jumlah Pertanyaan: {s.questions.length}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleSurveyActive(s.id)}
                  className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider ${
                    s.active 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}
                >
                  {s.active ? 'Aktif' : 'Draft'}
                </button>
              </div>
            ))}
          </div>
          <Pagination page={surveysPage} totalPages={totalSurveyPages} onPageChange={setSurveysPage} />
        </div>
      </div>
    );
  }

  return null;
}
