"use client";

import React, { useState, useEffect } from "react";

interface Contact {
  id: string;
  name: string;
  institution: string;
  specialization: string;
  phone: string;
  schedule: string;
  scheduleDays: string;
  status: "Tersedia" | "Sibuk" | "Tidak Aktif";
  type: "whatsapp" | "hotline";
}

export default function AdminContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  const [schedule, setSchedule] = useState("08:00 - 16:00");
  const [scheduleDays, setScheduleDays] = useState("Senin - Jumat");
  const [status, setStatus] = useState<"Tersedia" | "Sibuk" | "Tidak Aktif">("Tersedia");
  const [type, setType] = useState<"whatsapp" | "hotline">("whatsapp");

  const fetchContacts = () => {
    fetch("/api/admin/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts) {
          setContacts(data.contacts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading contacts:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedContact(null);
    setName("");
    setInstitution("");
    setSpecialization("");
    setPhone("");
    setSchedule("08:00 - 16:00");
    setScheduleDays("Senin - Jumat");
    setStatus("Tersedia");
    setType("whatsapp");
    setShowModal(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setModalMode("edit");
    setSelectedContact(c);
    setName(c.name);
    setInstitution(c.institution);
    setSpecialization(c.specialization);
    setPhone(c.phone);
    setSchedule(c.schedule);
    setScheduleDays(c.scheduleDays);
    setStatus(c.status);
    setType(c.type);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !institution || !specialization || !phone) {
      alert("Harap isi semua kolom wajib.");
      return;
    }

    const payload = {
      name,
      institution,
      specialization,
      phone,
      schedule,
      scheduleDays,
      status,
      type
    };

    try {
      if (modalMode === "add") {
        const res = await fetch("/api/admin/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          fetchContacts();
          setShowModal(false);
        } else {
          alert(data.error || "Gagal menambah kontak.");
        }
      } else if (modalMode === "edit" && selectedContact) {
        const res = await fetch(`/api/admin/contacts/${selectedContact.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          fetchContacts();
          setShowModal(false);
        } else {
          alert(data.error || "Gagal memperbarui kontak.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kontak ini?")) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data.error || "Gagal menghapus kontak.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  const handleCycleStatus = async (c: Contact) => {
    const nextStatusMap: Record<Contact["status"], Contact["status"]> = {
      Tersedia: "Sibuk",
      Sibuk: "Tidak Aktif",
      "Tidak Aktif": "Tersedia",
    };
    const nextStatus = nextStatusMap[c.status];

    try {
      const res = await fetch(`/api/admin/contacts/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "Tersedia":
        return "bg-status-success/10 text-status-success";
      case "Sibuk":
        return "bg-status-warning/10 text-status-warning";
      case "Tidak Aktif":
        return "bg-surface-variant text-on-surface-variant";
    }
  };

  const getStatusDot = (status: Contact["status"]) => {
    switch (status) {
      case "Tersedia":
        return "bg-status-success";
      case "Sibuk":
        return "bg-status-warning";
      case "Tidak Aktif":
        return "bg-outline";
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat daftar kontak...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Manajemen Kontak Profesional
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola daftar psikolog, psikiater, dan layanan krisis darurat.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 w-fit active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Kontak
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">contacts</span>
            Total Kontak
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{contacts.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Tersedia
          </div>
          <p className="font-heading font-bold text-2xl text-status-success">
            {contacts.filter((c) => c.status === "Tersedia").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Sibuk
          </div>
          <p className="font-heading font-bold text-2xl text-status-warning">
            {contacts.filter((c) => c.status === "Sibuk").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">emergency</span>
            Hotline
          </div>
          <p className="font-heading font-bold text-2xl text-status-error">
            {contacts.filter((c) => c.type === "hotline").length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, spesialisasi, atau institusi..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["Semua", "Tersedia", "Sibuk", "Tidak Aktif"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Nama / Institusi</th>
                <th className="px-6 py-4">Spesialisasi</th>
                <th className="px-6 py-4">Jam Operasional</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.type === "hotline" ? (
                          <div className="w-9 h-9 rounded-lg bg-status-error/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-status-error text-[18px]">
                              emergency
                            </span>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate max-w-[240px]">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-outline">{c.institution}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                        {c.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface text-sm">{c.schedule}</div>
                      <div className="text-[10px] text-text-muted">{c.scheduleDays}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleCycleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)} cursor-pointer transition-all hover:opacity-80`}
                        title="Klik untuk mengubah status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`} />
                        {c.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="inline-flex items-center p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all active:scale-[0.97]"
                          title="Hapus Kontak"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                      search_off
                    </span>
                    Tidak ada kontak yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-outline-variant/30 text-sm">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <div key={c.id} className="p-4 space-y-3 hover:bg-surface-container-low transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {c.type === "hotline" ? (
                        <div className="w-10 h-10 rounded-lg bg-status-error/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-status-error text-[20px]">
                            emergency
                          </span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface truncate max-w-[180px]">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-outline truncate max-w-[180px]">{c.institution}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCycleStatus(c)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(c.status)} cursor-pointer transition-all hover:opacity-80 shrink-0`}
                      title="Klik untuk mengubah status"
                    >
                      <span className={`w-1 h-1 rounded-full ${getStatusDot(c.status)}`} />
                      {c.status}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant pt-1">
                    <div>
                      <span className="text-outline block text-[10px] uppercase font-bold">Spesialisasi</span>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-surface-container-high text-on-surface-variant">
                        {c.specialization}
                      </span>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px] uppercase font-bold">Operasional</span>
                      <span className="block mt-0.5 font-medium text-on-surface">
                        {c.schedule}
                      </span>
                      <span className="block text-[9px] text-outline">
                        {c.scheduleDays}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-on-surface pt-1">
                    Telp: {c.phone}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10 justify-end">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all active:scale-[0.97]"
                      title="Hapus Kontak"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                  search_off
                </span>
                Tidak ada kontak yang sesuai pencarian.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg border border-outline-variant overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">contact_phone</span>
                </div>
                <h2 className="font-heading font-semibold text-lg text-on-surface">
                  {modalMode === "add" ? "Tambah Kontak Baru" : "Edit Kontak"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-on-surface">Nama Lengkap <span className="text-status-error">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="cth: Dr. Andi Setiawan, Sp.KJ"
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Institusi <span className="text-status-error">*</span></label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="cth: RS Sehat Mental"
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Spesialisasi <span className="text-status-error">*</span></label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="cth: Psikiater Klinis"
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-on-surface">Nomor Telepon / Hotline <span className="text-status-error">*</span></label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="cth: +62 812-3456-7890 atau 119 ext. 8"
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Jam Operasional <span className="text-status-error">*</span></label>
                    <input
                      type="text"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="cth: 08:00 - 16:00 atau 24 Jam"
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Hari Operasional <span className="text-status-error">*</span></label>
                    <input
                      type="text"
                      value={scheduleDays}
                      onChange={(e) => setScheduleDays(e.target.value)}
                      placeholder="cth: Senin - Jumat atau Setiap Hari"
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Jenis Kontak <span className="text-status-error">*</span></label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer text-on-surface"
                    >
                      <option value="whatsapp">WhatsApp Chat</option>
                      <option value="hotline">Hotline Telepon</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Status Awal <span className="text-status-error">*</span></label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer text-on-surface"
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Sibuk">Sibuk</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-[0.98]"
                >
                  {modalMode === "add" ? "Tambah" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
