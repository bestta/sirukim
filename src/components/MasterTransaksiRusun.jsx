import React, { useMemo, useState } from 'react';
import { useDb } from '../context/DbContext';
import { CalendarCheck2, CheckCircle2, MessageCircle, SearchCheck, Upload, UserRoundCheck, XCircle } from 'lucide-react';

const DOC_FIELDS = [
  { key: 'ktp', label: 'KTP' },
  { key: 'kk', label: 'KK' },
  { key: 'slipGaji', label: 'SLIP GAJI' },
  { key: 'npwp', label: 'NPWP' },
  { key: 'suratBelumPunyaRumah', label: 'Surat Belum Mempunyai Rumah' },
  { key: 'skBekerja', label: 'SK Bekerja' }
];

const normalizeDocument = (value) => {
  if (!value) return { name: '', preview: '', mime: '' };

  if (typeof value === 'string') {
    const canPreview = value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://');
    const mime = value.startsWith('data:') ? value.split(';')[0].replace('data:', '') : '';
    return {
      name: canPreview ? 'Dokumen Upload' : value,
      preview: canPreview ? value : '',
      mime
    };
  }

  return {
    name: value.name || '',
    preview: value.preview || '',
    mime: value.mime || ''
  };
};

const isImageDocument = (doc) => String(doc?.mime || '').startsWith('image/');

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID');
};

const getBadge = (status) => {
  const map = {
    pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    valid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    revisi: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    tidak_valid: 'bg-red-500/10 text-red-500 border-red-500/20',
    disetujui: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    ditolak: 'bg-red-500/10 text-red-500 border-red-500/20',
    revisi_berkas: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    komplit_valid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    revisi_data: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    diterima: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

const statusLabel = (status) => {
  const map = {
    pending: 'Pending',
    valid: 'Valid',
    revisi: 'Revisi',
    tidak_valid: 'Tidak Valid',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    revisi_berkas: 'Revisi Berkas',
    komplit_valid: 'Komplit & Valid',
    revisi_data: 'Revisi Data',
    diterima: 'Selesai Serah Terima'
  };

  return map[status] || status;
};

const openWhatsApp = (phone, message) => {
  if (!phone) {
    alert('Nomor WhatsApp belum tersedia.');
    return;
  }

  const normalizedPhone = String(phone).replace(/[^\d]/g, '').replace(/^0/, '62');
  const url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const getProcessStageMeta = (item) => {
  if (item?.handoverStatus === 'diterima') {
    return { step: 5, label: 'Tahap 5: Serah Terima Kunci', tone: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  }

  if (item?.reRegistrationStatus === 'komplit_valid') {
    return { step: 4, label: 'Tahap 4: Daftar Ulang', tone: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
  }

  if (item?.approvalStatus === 'disetujui') {
    return { step: 4, label: 'Tahap 4: Menunggu Daftar Ulang', tone: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
  }

  if (item?.approvalStatus === 'ditolak') {
    return { step: 3, label: 'Tahap 3: Selesai (Ditolak)', tone: 'bg-red-500/10 text-red-500 border-red-500/20' };
  }

  if (item?.approvalStatus === 'revisi_berkas') {
    return { step: 3, label: 'Tahap 3: Revisi Berkas', tone: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  }

  if (item?.approvalStatus !== 'pending') {
    return { step: 3, label: 'Tahap 3: Persetujuan', tone: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  }

  if (item?.verificationStatus !== 'pending') {
    return { step: 2, label: 'Tahap 2: Pemeriksaan Berkas', tone: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  }

  return { step: 1, label: 'Tahap 1: Pendaftaran', tone: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
};

const normalizeTransactionStatus = (item) => {
  if (!item) return item;

  const normalized = { ...item };

  if (normalized.handoverStatus === 'diterima') {
    normalized.reRegistrationStatus = 'komplit_valid';
    normalized.approvalStatus = 'disetujui';
    normalized.verificationStatus = 'valid';
    return normalized;
  }

  if (normalized.reRegistrationStatus && normalized.reRegistrationStatus !== 'pending') {
    normalized.approvalStatus = normalized.approvalStatus === 'pending' ? 'disetujui' : normalized.approvalStatus;
    normalized.verificationStatus = normalized.verificationStatus === 'pending' ? 'valid' : normalized.verificationStatus;
  }

  if (normalized.approvalStatus === 'disetujui' && normalized.verificationStatus === 'pending') {
    normalized.verificationStatus = 'valid';
  }

  return normalized;
};

export default function MasterTransaksiRusun({ activeMenu }) {
  const {
    currentUser,
    rusun,
    addBooking,
    sewaTransactions,
    addSewaTransaction,
    updateSewaTransaction,
    deleteSewaTransaction,
    scheduleSewaVerification,
    markSewaVerificationInviteSent,
    assessSewaTransaction,
    decideSewaTransaction,
    processSewaDaftarUlang,
    uploadSewaRevisionDocs,
    updateSewaDaftarUlangChecks,
    processSewaSerahTerima
  } = useDb();

  const [form, setForm] = useState({
    nik: '',
    phone: currentUser?.phone || '',
    rusunId: '',
    towerId: '',
    unitId: '',
    docs: {
      ktp: null,
      kk: null,
      slipGaji: null,
      npwp: null,
      suratBelumPunyaRumah: null,
      skBekerja: null
    }
  });

  const [handoverForm, setHandoverForm] = useState({
    transactionId: '',
    handoverDate: '',
    handoverProofFile: '',
    handoverNote: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    transactionId: '',
    verificationScheduleAt: '',
    verificationScheduleNote: 'Membawa berkas asli saat hadir.'
  });

  const [revisionDraft, setRevisionDraft] = useState({
    transactionId: '',
    stage: 0,
    docs: {}
  });

  const [detailId, setDetailId] = useState('');

  const isPenghuni = currentUser?.role === 'penghuni';
  const canProcess = ['administrator', 'entry_data', 'pimpinan_dinas'].includes(currentUser?.role);

  const rusunWithAvailableUnits = useMemo(
    () => rusun
      .map((item) => ({
        ...item,
        hasAvailable: item.towers.some((tower) => tower.units.some((unit) => unit.status === 'available'))
      }))
      .filter((item) => item.hasAvailable),
    [rusun]
  );

  const selectedRusun = useMemo(
    () => rusun.find((item) => item.id === form.rusunId) || null,
    [rusun, form.rusunId]
  );

  const selectedTowers = selectedRusun?.towers || [];
  const selectedTower = selectedTowers.find((item) => item.id === form.towerId) || null;
  const selectedTowerUnits = selectedTower?.units || [];
  const selectedTowerAvailableUnits = (selectedTower?.units || []).filter((unit) => unit.status === 'available');
  const selectedUnitDetail = selectedTowerAvailableUnits.find((unit) => unit.id === form.unitId) || null;

  const unitStatusSummary = useMemo(() => selectedTowerUnits.reduce((acc, unit) => {
    if (unit.status === 'available') acc.available += 1;
    else if (unit.status === 'booked') acc.booked += 1;
    else if (unit.status === 'maintenance') acc.maintenance += 1;
    else acc.occupied += 1;
    return acc;
  }, {
    available: 0,
    booked: 0,
    occupied: 0,
    maintenance: 0
  }), [selectedTowerUnits]);

  const visibleTransactions = useMemo(() => {
    if (!isPenghuni) return sewaTransactions;
    return sewaTransactions.filter((item) => (
      item.applicantUserId === currentUser?.id ||
      item.applicantEmail === currentUser?.email ||
      item.applicantName === currentUser?.name
    ));
  }, [sewaTransactions, isPenghuni, currentUser?.id, currentUser?.email, currentUser?.name]);

  const normalizedVisibleTransactions = useMemo(
    () => visibleTransactions.map((item) => normalizeTransactionStatus(item)),
    [visibleTransactions]
  );

  const filteredByMenu = useMemo(() => {
    if (activeMenu === 'master_transaksi_pemeriksaan') {
      return normalizedVisibleTransactions.filter((item) => item.documentsUploadedAt);
    }

    if (activeMenu === 'master_transaksi_persetujuan') {
      if (isPenghuni) {
        return normalizedVisibleTransactions.filter((item) => (
          item.verificationStatus === 'valid' ||
          item.approvalStatus !== 'pending' ||
          item.reRegistrationStatus !== 'pending' ||
          item.handoverStatus === 'diterima'
        ));
      }

      return normalizedVisibleTransactions.filter((item) => (
        item.verificationStatus === 'valid' ||
        item.verificationStatus === 'revisi' ||
        item.verificationStatus === 'tidak_valid'
      ));
    }

    if (activeMenu === 'master_transaksi_daftar_ulang') {
      return normalizedVisibleTransactions.filter((item) => item.verificationStatus === 'valid' && item.approvalStatus === 'disetujui');
    }

    if (activeMenu === 'master_transaksi_serah_terima') {
      return normalizedVisibleTransactions.filter((item) => item.reRegistrationStatus === 'komplit_valid');
    }

    return normalizedVisibleTransactions;
  }, [normalizedVisibleTransactions, activeMenu, isPenghuni]);

  const myNotifications = useMemo(() => {
    if (!isPenghuni) return [];

    return normalizedVisibleTransactions.flatMap((item) => {
      const notifs = [];

      if (item.verificationScheduleAt) {
        notifs.push({
          id: `${item.id}-invite`,
          text: `Undangan verifikasi berkas untuk ${item.rusunName || 'Rusun'} dijadwalkan ${formatDateTime(item.verificationScheduleAt)}.`
        });
      }

      if (item.approvalStatus !== 'pending') {
        notifs.push({
          id: `${item.id}-approval`,
          text: `Status persetujuan pendaftaran: ${statusLabel(item.approvalStatus)}.`
        });
      }

      return notifs;
    });
  }, [isPenghuni, normalizedVisibleTransactions]);

  const handleDocChange = (key, file) => {
    if (!file) {
      setForm((prev) => ({
        ...prev,
        docs: {
          ...prev.docs,
          [key]: null
        }
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        docs: {
          ...prev.docs,
          [key]: {
            name: file.name,
            mime: file.type || '',
            preview: typeof reader.result === 'string' ? reader.result : ''
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const openDocumentPreview = (documentValue) => {
    const doc = normalizeDocument(documentValue);
    if (!doc.preview) {
      alert('Preview berkas tidak tersedia. Silakan upload ulang dokumen dengan file asli.');
      return;
    }
    window.open(doc.preview, '_blank', 'noopener,noreferrer');
  };

  const updateDocumentChecker = (item, docKey, patch) => {
    const currentChecks = item.documentChecks || {};
    const currentDocCheck = currentChecks[docKey] || {
      checked: false,
      status: 'pending',
      note: '',
      checkedBy: '',
      checkedAt: ''
    };

    const nextChecks = {
      ...currentChecks,
      [docKey]: {
        ...currentDocCheck,
        ...patch,
        checkedBy: currentUser?.name || currentDocCheck.checkedBy,
        checkedAt: new Date().toISOString()
      }
    };

    updateSewaTransaction(item.id, { documentChecks: nextChecks });
  };

  const getDocumentChecker = (item, docKey) => {
    const check = item.documentChecks?.[docKey];
    return {
      checked: Boolean(check?.checked),
      status: check?.status || 'pending',
      note: check?.note || '',
      checkedBy: check?.checkedBy || '-',
      checkedAt: check?.checkedAt || ''
    };
  };

  const handleSubmitPendaftaran = (event) => {
    event.preventDefault();

    if (!form.nik || !form.phone || !form.rusunId || !form.towerId || !form.unitId) {
      alert('Lengkapi data utama pendaftaran.');
      return;
    }

    const missingDoc = DOC_FIELDS.find((item) => !normalizeDocument(form.docs[item.key]).name);
    if (missingDoc) {
      alert(`Dokumen ${missingDoc.label} wajib diupload.`);
      return;
    }

    const matchedRusun = rusun.find((item) => item.id === form.rusunId);
    const matchedTower = matchedRusun?.towers.find((item) => item.id === form.towerId);
    const matchedUnit = matchedTower?.units.find((item) => item.id === form.unitId);

    if (!matchedRusun || !matchedTower || !matchedUnit) {
      alert('Pilihan rusun, blok, atau unit tidak valid.');
      return;
    }

    addBooking({
      applicantName: currentUser?.name,
      nik: form.nik,
      email: currentUser?.email,
      phone: form.phone,
      rusunId: matchedRusun.id,
      rusunName: matchedRusun.name,
      towerId: matchedTower.id,
      unitId: matchedUnit.id,
      unitNumber: matchedUnit.number,
      type: String(matchedRusun.type || '').toLowerCase().includes('milik') ? 'Rusunami Umum' : 'Rusunawa Umum'
    });

    addSewaTransaction({
      applicantUserId: currentUser?.id,
      applicantName: currentUser?.name,
      applicantEmail: currentUser?.email,
      nik: form.nik,
      phone: form.phone,
      rusunId: matchedRusun.id,
      rusunName: matchedRusun.name,
      towerId: matchedTower.id,
      towerName: matchedTower.name,
      unitId: matchedUnit.id,
      unitNumber: matchedUnit.number,
      documents: form.docs
    });

    setForm({
      nik: '',
      phone: currentUser?.phone || '',
      rusunId: '',
      towerId: '',
      unitId: '',
      docs: {
        ktp: null,
        kk: null,
        slipGaji: null,
        npwp: null,
        suratBelumPunyaRumah: null,
        skBekerja: null
      }
    });

    alert('Pendaftaran sewa rusun berhasil dikirim ke admin dan pimpinan untuk validasi.');
  };

  const handleEdit = (item) => {
    const phone = window.prompt('Ubah nomor HP / WA:', item.phone || '');
    if (phone === null) return;

    const rusunName = window.prompt('Ubah nama rumah rusun:', item.rusunName || '');
    if (rusunName === null) return;

    updateSewaTransaction(item.id, {
      phone: phone.trim() || item.phone,
      rusunName: rusunName.trim() || item.rusunName
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    deleteSewaTransaction(id, { restoreUnit: true });
  };

  const openSchedulePicker = (item) => {
    const parsedDate = item.verificationScheduleAt
      ? new Date(item.verificationScheduleAt).toISOString().slice(0, 16)
      : '';

    setScheduleForm({
      transactionId: item.id,
      verificationScheduleAt: parsedDate,
      verificationScheduleNote: item.verificationScheduleNote || 'Membawa berkas asli saat hadir.'
    });
  };

  const submitSchedule = (event) => {
    event.preventDefault();
    if (!scheduleForm.transactionId || !scheduleForm.verificationScheduleAt) {
      alert('Tanggal dan jam verifikasi wajib diisi.');
      return;
    }

    scheduleSewaVerification(scheduleForm.transactionId, {
      verificationScheduleAt: scheduleForm.verificationScheduleAt,
      verificationScheduleNote: scheduleForm.verificationScheduleNote
    });

    setScheduleForm({
      transactionId: '',
      verificationScheduleAt: '',
      verificationScheduleNote: 'Membawa berkas asli saat hadir.'
    });
  };

  const handleSendInviteWa = (item) => {
    const message = `Yth. ${item.applicantName}, undangan verifikasi berkas sewa rusun dijadwalkan pada ${formatDateTime(item.verificationScheduleAt)}. Catatan: ${item.verificationScheduleNote || '-'}.`;
    openWhatsApp(item.phone, message);
    markSewaVerificationInviteSent(item.id);
  };

  const handleAssessment = (item, status) => {
    const note = window.prompt(`Catatan pemeriksaan (${statusLabel(status)}):`, item.verificationNote || '');
    if (note === null) return;
    assessSewaTransaction(item.id, status, note);
  };

  const handleApproval = (item, status) => {
    const note = window.prompt(`Catatan persetujuan (${statusLabel(status)}):`, item.approvalNote || '');
    if (note === null) return;

    decideSewaTransaction(item.id, status, note);

    const waText = `Yth. ${item.applicantName}, status persetujuan pendaftaran sewa rusun Anda adalah: ${statusLabel(status)}. Catatan: ${note || '-'}.`;
    openWhatsApp(item.phone, waText);
  };

  const handleDaftarUlang = (item, status) => {
    const note = window.prompt(`Catatan proses pendaftaran ulang (${statusLabel(status)}):`, item.reRegistrationNote || '');
    if (note === null) return;
    processSewaDaftarUlang(item.id, status, note);
  };

  const openRevisionForm = (item, stage) => {
    setRevisionDraft({
      transactionId: item.id,
      stage,
      docs: {}
    });
  };

  const handleRevisionDocChange = (docKey, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRevisionDraft((prev) => ({
        ...prev,
        docs: {
          ...prev.docs,
          [docKey]: {
            name: file.name,
            mime: file.type || '',
            preview: typeof reader.result === 'string' ? reader.result : ''
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const submitRevisionDocs = (event) => {
    event.preventDefault();
    if (!revisionDraft.transactionId || !revisionDraft.stage) return;

    const hasAnyDoc = DOC_FIELDS.some((field) => normalizeDocument(revisionDraft.docs[field.key]).name);
    if (!hasAnyDoc) {
      alert('Minimal 1 dokumen revisi harus diupload.');
      return;
    }

    uploadSewaRevisionDocs(revisionDraft.transactionId, revisionDraft.stage, revisionDraft.docs);
    setRevisionDraft({ transactionId: '', stage: 0, docs: {} });
    alert(`Berkas revisi tahap ${revisionDraft.stage} berhasil dikirim.`);
  };

  const startSerahTerima = (item) => {
    setHandoverForm({
      transactionId: item.id,
      handoverDate: item.handoverDate || '',
      handoverProofFile: item.handoverProofFile || '',
      handoverNote: item.handoverNote || ''
    });
  };

  const submitSerahTerima = (event) => {
    event.preventDefault();

    if (!handoverForm.transactionId || !handoverForm.handoverDate || !handoverForm.handoverProofFile) {
      alert('Tanggal serah terima dan bukti serah terima wajib diisi.');
      return;
    }

    processSewaSerahTerima(handoverForm.transactionId, {
      handoverDate: handoverForm.handoverDate,
      handoverProofFile: handoverForm.handoverProofFile,
      handoverNote: handoverForm.handoverNote
    });

    setHandoverForm({ transactionId: '', handoverDate: '', handoverProofFile: '', handoverNote: '' });
  };

  const renderActionByMenu = (item) => {
    if (activeMenu === 'master_transaksi_pendaftaran') {
      return (
        <div className="flex flex-wrap gap-2">
          {canProcess && (
            <button onClick={() => handleEdit(item)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-500">Edit</button>
          )}
          {isPenghuni && item.requiredRevisionStage > 0 && (
            <button
              onClick={() => openRevisionForm(item, item.requiredRevisionStage)}
              className="px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-600"
            >
              Upload Revisi Tahap {item.requiredRevisionStage}
            </button>
          )}
          {canProcess && (
            <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 bg-red-500/10 text-red-500">Hapus</button>
          )}
          {canProcess && (
            <>
              <button onClick={() => openSchedulePicker(item)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-orange-500/20 bg-orange-500/10 text-orange-500">Jadwalkan Verifikasi</button>
              <button
                onClick={() => handleSendInviteWa(item)}
                disabled={!item.verificationScheduleAt}
                className="px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 disabled:opacity-50"
              >
                Kirim WhatsApp
              </button>
            </>
          )}
        </div>
      );
    }

    if (activeMenu === 'master_transaksi_pemeriksaan') {
      return canProcess ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleAssessment(item, 'valid')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Valid</button>
          <button onClick={() => handleAssessment(item, 'revisi')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-500">Revisi</button>
          <button onClick={() => handleAssessment(item, 'tidak_valid')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 bg-red-500/10 text-red-500">Tidak Valid</button>
        </div>
      ) : <span className="text-[10px] text-slate-400">Menunggu pemeriksaan admin/pimpinan</span>;
    }

    if (activeMenu === 'master_transaksi_persetujuan') {
      return canProcess ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleEdit(item)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-500">Edit</button>
          <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 bg-red-500/10 text-red-500">Hapus</button>
          <button onClick={() => handleApproval(item, 'disetujui')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Disetujui</button>
          <button onClick={() => handleApproval(item, 'ditolak')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 bg-red-500/10 text-red-500">Ditolak</button>
          <button onClick={() => handleApproval(item, 'revisi_berkas')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-500">Revisi Berkas</button>
        </div>
      ) : <span className="text-[10px] text-slate-400">Menunggu keputusan persetujuan</span>;
    }

    if (activeMenu === 'master_transaksi_daftar_ulang') {
      return canProcess ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleEdit(item)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-500">Edit</button>
          <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 bg-red-500/10 text-red-500">Hapus</button>
          <button onClick={() => handleDaftarUlang(item, 'komplit_valid')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Cek Komplit & Valid</button>
          <button onClick={() => handleDaftarUlang(item, 'revisi_data')} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-500">Minta Revisi Data</button>
        </div>
      ) : <span className="text-[10px] text-slate-400">Proses daftar ulang oleh admin/pimpinan</span>;
    }

    if (activeMenu === 'master_transaksi_serah_terima') {
      return canProcess ? (
        <button onClick={() => startSerahTerima(item)} className="px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-500">Proses Terima Kunci</button>
      ) : <span className="text-[10px] text-slate-400">Menunggu serah terima kunci</span>;
    }

    return null;
  };

  const renderStatusColumns = (item) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
      <div className="space-y-1">
        <p className="font-bold text-slate-400 uppercase">Verifikasi</p>
        <span className={`px-2 py-0.5 rounded-full border font-bold ${getBadge(item.verificationStatus)}`}>{statusLabel(item.verificationStatus)}</span>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-slate-400 uppercase">Persetujuan</p>
        <span className={`px-2 py-0.5 rounded-full border font-bold ${getBadge(item.approvalStatus)}`}>{statusLabel(item.approvalStatus)}</span>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-slate-400 uppercase">Daftar Ulang</p>
        <span className={`px-2 py-0.5 rounded-full border font-bold ${getBadge(item.reRegistrationStatus)}`}>{statusLabel(item.reRegistrationStatus)}</span>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-slate-400 uppercase">Serah Terima</p>
        <span className={`px-2 py-0.5 rounded-full border font-bold ${getBadge(item.handoverStatus)}`}>{statusLabel(item.handoverStatus)}</span>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-slate-400 uppercase">Undangan Verifikasi</p>
        <p className="text-slate-500">{formatDateTime(item.verificationScheduleAt)}</p>
      </div>
    </div>
  );

  const getUnitStatusStyle = (status) => {
    if (status === 'available') {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
    }

    if (status === 'booked') {
      return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
    }

    if (status === 'maintenance') {
      return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400';
    }

    return 'bg-slate-200/70 dark:bg-slate-800 border-slate-300/80 dark:border-slate-700 text-slate-500 dark:text-slate-400';
  };

  const getUnitStatusLabel = (status) => {
    if (status === 'available') return 'Kosong';
    if (status === 'booked') return 'Terbooking';
    if (status === 'maintenance') return 'Perawatan';
    return 'Ditempati';
  };

  return (
    <div className="space-y-6">
      {isPenghuni && myNotifications.length > 0 && (
        <div className="glass-card p-4 border-l-4 border-orange-500 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500">Notifikasi Penghuni</h3>
          {myNotifications.map((notif) => (
            <p key={notif.id} className="text-xs text-slate-500">- {notif.text}</p>
          ))}
        </div>
      )}

      {activeMenu === 'master_transaksi_pendaftaran' && isPenghuni && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Pendaftaran Sewa Rusun
          </h3>

          <form onSubmit={handleSubmitPendaftaran} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.nik}
              onChange={(event) => setForm((prev) => ({ ...prev, nik: event.target.value }))}
              placeholder="NIK"
              className="glass-input text-xs"
            />
            <input
              type="text"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="No HP / WA"
              className="glass-input text-xs"
            />

            <select
              value={form.rusunId}
              onChange={(event) => {
                const nextRusun = rusun.find((item) => item.id === event.target.value);
                const firstTower = nextRusun?.towers?.[0];
                setForm((prev) => ({
                  ...prev,
                  rusunId: event.target.value,
                  towerId: firstTower?.id || '',
                  unitId: ''
                }));
              }}
              className="glass-input text-xs bg-white dark:bg-slate-900"
            >
              <option value="">-- Pilih Rumah Susun --</option>
              {rusunWithAvailableUnits.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>

            <select
              value={form.towerId}
              onChange={(event) => setForm((prev) => ({ ...prev, towerId: event.target.value, unitId: '' }))}
              disabled={!form.rusunId}
              className="glass-input text-xs bg-white dark:bg-slate-900 disabled:opacity-60"
            >
              <option value="">-- Pilih Blok / Tower --</option>
              {selectedTowers.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>

            <select
              value={form.unitId}
              onChange={(event) => setForm((prev) => ({ ...prev, unitId: event.target.value }))}
              disabled={!form.towerId}
              className="glass-input text-xs bg-white dark:bg-slate-900 disabled:opacity-60"
            >
              <option value="">-- Pilih Unit Tersedia --</option>
              {selectedTowerAvailableUnits.map((item) => (
                <option key={item.id} value={item.id}>Unit {item.number} - Lantai {item.floor}</option>
              ))}
            </select>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Unit Pada Tower Terpilih</h4>
                <span className="text-[10px] font-semibold text-slate-400">Total {selectedTowerUnits.length} unit</span>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                <span className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Kosong: {unitStatusSummary.available}</span>
                <span className="px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">Terbooking: {unitStatusSummary.booked}</span>
                <span className="px-2.5 py-1 rounded-full border border-slate-300/80 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Ditempati: {unitStatusSummary.occupied}</span>
                <span className="px-2.5 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">Perawatan: {unitStatusSummary.maintenance}</span>
              </div>

              {selectedTowerUnits.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Pilih rumah susun dan tower untuk menampilkan status unit.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedTowerUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => {
                        if (unit.status === 'available') {
                          setForm((prev) => ({ ...prev, unitId: unit.id }));
                        }
                      }}
                      className={`rounded-xl border px-3 py-2 text-left transition ${getUnitStatusStyle(unit.status)} ${unit.status === 'available' ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed opacity-85'}`}
                    >
                      <p className="text-xs font-bold">Unit {unit.number}</p>
                      <p className="text-[10px] mt-0.5">Lantai {unit.floor}</p>
                      <p className="text-[10px] mt-1 font-semibold">{getUnitStatusLabel(unit.status)}</p>
                      {unit.tenantName && (
                        <p className="text-[10px] mt-1 truncate">Penghuni: {unit.tenantName}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 flex items-center">
              {selectedUnitDetail ? `Unit dipilih: ${selectedUnitDetail.number} (Lantai ${selectedUnitDetail.floor})` : 'Pilih unit untuk melanjutkan proses pendaftaran.'}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center">Upload dokumen wajib untuk proses validasi admin & pimpinan.</div>

            {DOC_FIELDS.map((item) => (
              <label key={item.key} className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">{item.label}</span>
                <input type="file" onChange={(event) => handleDocChange(item.key, event.target.files?.[0])} className="glass-input text-xs" />
                {normalizeDocument(form.docs[item.key]).name && (
                  <span className="text-[10px] text-emerald-500">{normalizeDocument(form.docs[item.key]).name}</span>
                )}
              </label>
            ))}

            <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700 text-xs py-2.5 md:col-span-2 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Kirim Pendaftaran</span>
            </button>
          </form>

          {canProcess && scheduleForm.transactionId && (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500">Jadwal Undangan Verifikasi</h4>
              <form onSubmit={submitSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={scheduleForm.verificationScheduleAt}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, verificationScheduleAt: event.target.value }))}
                  className="glass-input text-xs"
                />
                <input
                  type="text"
                  value={scheduleForm.verificationScheduleNote}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, verificationScheduleNote: event.target.value }))}
                  className="glass-input text-xs"
                  placeholder="Catatan verifikasi"
                />
                <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700 text-xs py-2 md:col-span-2">Simpan Jadwal Verifikasi</button>
              </form>
            </div>
          )}

        </div>
      )}

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Data Transaksi Sewa Rusun
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total {filteredByMenu.length} Data</span>
        </div>

        <div className="space-y-4">
          {filteredByMenu.map((item) => (
            <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getProcessStageMeta(item).tone}`}>
                    {getProcessStageMeta(item).label}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.applicantName}</h4>
                  <p className="text-xs text-slate-400">{item.rusunName} / {item.towerName || '-'} / Unit {item.unitNumber}</p>
                  <p className="text-[10px] text-slate-400">No WA: {item.phone || '-'} • NIK: {item.nik || '-'}</p>
                </div>

                <div className="flex flex-wrap gap-2 items-start justify-end">
                  <button
                    onClick={() => setDetailId((prev) => (prev === item.id ? '' : item.id))}
                    className="px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-500/20 bg-slate-500/10 text-slate-400"
                  >
                    {detailId === item.id ? 'Tutup Detail' : 'Lihat Detail'}
                  </button>
                  {renderActionByMenu(item)}
                </div>
              </div>

              {renderStatusColumns(item)}

              {detailId === item.id && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/70 dark:bg-slate-900/40">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Detail Dokumen Upload</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {DOC_FIELDS.map((doc) => {
                        const documentValue = item.documents?.[doc.key];
                        const parsedDoc = normalizeDocument(documentValue);
                        const checker = getDocumentChecker(item, doc.key);

                        return (
                          <div key={doc.key} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-900/50 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{doc.label}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{parsedDoc.name || 'Belum upload dokumen'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => openDocumentPreview(documentValue)}
                                disabled={!parsedDoc.preview}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-500 disabled:opacity-50"
                              >
                                Lihat Berkas
                              </button>
                            </div>

                            {parsedDoc.preview && isImageDocument(parsedDoc) && (
                              <img
                                src={parsedDoc.preview}
                                alt={`Preview ${doc.label}`}
                                className="w-full h-28 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                              />
                            )}

                            {activeMenu === 'master_transaksi_pemeriksaan' && canProcess && (
                              <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-2 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                    <input
                                      type="checkbox"
                                      checked={checker.checked}
                                      onChange={(event) => updateDocumentChecker(item, doc.key, {
                                        checked: event.target.checked,
                                        status: event.target.checked ? (checker.status === 'pending' ? 'valid' : checker.status) : 'pending'
                                      })}
                                    />
                                    Sudah diperiksa
                                  </label>
                                  <select
                                    value={checker.status}
                                    onChange={(event) => updateDocumentChecker(item, doc.key, {
                                      status: event.target.value,
                                      checked: event.target.value !== 'pending'
                                    })}
                                    className="text-[10px] glass-input py-1 px-2 bg-white dark:bg-slate-900"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="valid">Valid</option>
                                    <option value="revisi">Revisi</option>
                                    <option value="tidak_valid">Tidak Valid</option>
                                  </select>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const note = window.prompt(`Catatan pemeriksa untuk ${doc.label}:`, checker.note || '');
                                    if (note === null) return;
                                    updateDocumentChecker(item, doc.key, { note });
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-500/20 bg-slate-500/10 text-slate-500"
                                >
                                  Isi Catatan Checker
                                </button>

                                <p className="text-[10px] text-slate-500">Status: {checker.status === 'tidak_valid' ? 'Tidak Valid' : checker.status === 'revisi' ? 'Revisi' : checker.status === 'valid' ? 'Valid' : 'Pending'}</p>
                                <p className="text-[10px] text-slate-500">Checker: {checker.checkedBy}</p>
                                <p className="text-[10px] text-slate-500">Waktu: {formatDateTime(checker.checkedAt)}</p>
                                <p className="text-[10px] text-slate-500">Catatan: {checker.note || '-'}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-500">
                    <p>Tanggal Pendaftaran: {formatDateTime(item.createdAt)}</p>
                    <p>Jadwal Verifikasi: {formatDateTime(item.verificationScheduleAt)}</p>
                    <p>Catatan Verifikasi: {item.verificationNote || '-'}</p>
                    <p>Catatan Persetujuan: {item.approvalNote || '-'}</p>
                    <p>Catatan Daftar Ulang: {item.reRegistrationNote || '-'}</p>
                    <p>Bukti Serah Terima: {item.handoverProofFile || '-'}</p>
                  </div>

                  {isPenghuni && item.requiredRevisionStage > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Upload Berkas Revisi Tahap {item.requiredRevisionStage}</p>
                        <button
                          type="button"
                          onClick={() => openRevisionForm(item, item.requiredRevisionStage)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-600"
                        >
                          Isi Berkas Revisi
                        </button>
                      </div>

                      {revisionDraft.transactionId === item.id && revisionDraft.stage === item.requiredRevisionStage && (
                        <form onSubmit={submitRevisionDocs} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {DOC_FIELDS.map((doc) => (
                            <label key={doc.key} className="flex flex-col gap-1">
                              <span className="text-[10px] font-semibold text-slate-500">{doc.label}</span>
                              <input type="file" onChange={(event) => handleRevisionDocChange(doc.key, event.target.files?.[0])} className="glass-input text-xs" />
                              {normalizeDocument(revisionDraft.docs[doc.key]).name && (
                                <span className="text-[10px] text-emerald-500">{normalizeDocument(revisionDraft.docs[doc.key]).name}</span>
                              )}
                            </label>
                          ))}
                          <button type="submit" className="btn-primary bg-amber-600 hover:bg-amber-700 text-xs py-2 md:col-span-2">Kirim Berkas Revisi Tahap {item.requiredRevisionStage}</button>
                        </form>
                      )}
                    </div>
                  )}

                  {activeMenu === 'master_transaksi_daftar_ulang' && canProcess && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-3">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Checker Daftar Ulang</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-600">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(item.reRegistrationChecks?.dokumenLengkap)}
                            onChange={(event) => updateSewaDaftarUlangChecks(item.id, { dokumenLengkap: event.target.checked })}
                          />
                          Dokumen Lengkap
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(item.reRegistrationChecks?.dataPenghuniValid)}
                            onChange={(event) => updateSewaDaftarUlangChecks(item.id, { dataPenghuniValid: event.target.checked })}
                          />
                          Data Penghuni Valid
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(item.reRegistrationChecks?.pembayaranValid)}
                            onChange={(event) => updateSewaDaftarUlangChecks(item.id, { pembayaranValid: event.target.checked })}
                          />
                          Pembayaran Valid
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const checks = item.reRegistrationChecks || {};
                          if (!checks.dokumenLengkap || !checks.dataPenghuniValid || !checks.pembayaranValid) {
                            alert('Semua checker daftar ulang wajib valid sebelum diproses ke serah terima.');
                            return;
                          }
                          handleDaftarUlang(item, 'komplit_valid');
                        }}
                        className="px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                      >
                        Proses ke Menu Serah Terima Kunci
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredByMenu.length === 0 && (
            <div className="text-xs text-slate-400 italic text-center py-6">Belum ada data transaksi untuk tahap ini.</div>
          )}
        </div>
      </div>

      {activeMenu === 'master_transaksi_serah_terima' && canProcess && handoverForm.transactionId && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Form Proses Terima Kunci</h3>
          <form onSubmit={submitSerahTerima} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={handoverForm.handoverDate}
              onChange={(event) => setHandoverForm((prev) => ({ ...prev, handoverDate: event.target.value }))}
              className="glass-input text-xs"
            />
            <input
              type="file"
              onChange={(event) => setHandoverForm((prev) => ({ ...prev, handoverProofFile: event.target.files?.[0]?.name || '' }))}
              className="glass-input text-xs"
            />
            <textarea
              value={handoverForm.handoverNote}
              onChange={(event) => setHandoverForm((prev) => ({ ...prev, handoverNote: event.target.value }))}
              placeholder="Catatan serah terima kunci"
              className="glass-input text-xs min-h-[90px] md:col-span-2"
            />
            <button type="submit" className="btn-primary bg-blue-600 hover:bg-blue-700 text-xs py-2.5 md:col-span-2 flex items-center justify-center gap-2">
              <UserRoundCheck className="w-4 h-4" />
              <span>Simpan Serah Terima Kunci</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="glass-card p-4 text-center">
          <CalendarCheck2 className="w-5 h-5 mx-auto text-orange-500" />
          <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Pendaftaran</p>
        </div>
        <div className="glass-card p-4 text-center">
          <SearchCheck className="w-5 h-5 mx-auto text-blue-500" />
          <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Pemeriksaan</p>
        </div>
        <div className="glass-card p-4 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500" />
          <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Persetujuan</p>
        </div>
        <div className="glass-card p-4 text-center">
          <MessageCircle className="w-5 h-5 mx-auto text-amber-500" />
          <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Daftar Ulang</p>
        </div>
        <div className="glass-card p-4 text-center">
          <XCircle className="w-5 h-5 mx-auto text-purple-500" />
          <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Serah Terima Kunci</p>
        </div>
      </div>
    </div>
  );
}
