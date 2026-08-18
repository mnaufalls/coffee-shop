"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  PencilSimple,
  Trash,
  Key,
  CaretLeft,
  CaretRight,
  X,
  Check,
  MagnifyingGlass,
} from "@phosphor-icons/react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const emptyForm = { name: "", email: "", phoneNumber: "", password: "" };

export default function OwnerStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "password">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStaff() {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page: String(page), limit: "10" });
        if (search) params.set("search", search);
        const res = await fetch(`/api/staff?${params}`, { credentials: "include", cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to fetch staff");
        setStaff(json.data ?? []);
        setMeta(json.meta);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch staff");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadStaff();
    return () => { cancelled = true; };
  }, [page, search, refreshKey]);

  function openCreate() {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(s: Staff) {
    setModalMode("edit");
    setEditingId(s.id);
    setForm({ name: s.name, email: s.email, phoneNumber: s.phoneNumber, password: "" });
    setFormErrors({});
    setShowModal(true);
  }

  function openPassword(s: Staff) {
    setModalMode("password");
    setEditingId(s.id);
    setForm({ ...emptyForm, name: s.name });
    setFormErrors({});
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setSuccess("");

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/staff", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password,
            role: "admin",
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (json.errors) setFormErrors(json.errors);
          throw new Error(json.message ?? "Failed to create staff");
        }
        setSuccess("Staff created successfully");
        setShowModal(false);
        setRefreshKey((k) => k + 1);
      } else if (modalMode === "edit" && editingId) {
        const res = await fetch(`/api/staff/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phoneNumber: form.phoneNumber,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (json.errors) setFormErrors(json.errors);
          throw new Error(json.message ?? "Failed to update staff");
        }
        setSuccess("Staff updated successfully");
        setShowModal(false);
        setRefreshKey((k) => k + 1);
      } else if (modalMode === "password" && editingId) {
        const res = await fetch(`/api/staff/${editingId}/password`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: form.password }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (json.errors) setFormErrors(json.errors);
          throw new Error(json.message ?? "Failed to change password");
        }
        setSuccess("Password changed successfully");
        setShowModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(s: Staff) {
    if (!confirm(`Are you sure you want to ${s.isActive ? "deactivate" : "activate"} ${s.name}?`)) return;
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/staff/${s.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to update staff");
      setSuccess(`Staff ${s.isActive ? "deactivated" : "activated"} successfully`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users size={28} weight="bold" />
            <h1 className="text-3xl font-black font-[family-name:var(--font-bricolage)] uppercase">Staff</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-600">Manage staff accounts.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <Plus size={16} weight="bold" />
          Add Staff
        </button>
      </header>

      {error && <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">{error}</div>}
      {success && <div className="border-2 border-black bg-green-300 p-4 text-sm font-bold">{success}</div>}

      <div className="relative max-w-sm">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full border-2 border-black bg-white py-2 pl-9 pr-4 text-sm font-bold outline-none focus:bg-orange-50"
        />
      </div>

      {isLoading ? (
        <p className="font-bold">Loading staff...</p>
      ) : staff.length === 0 ? (
        <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
          <p className="font-bold">No staff found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-black bg-yellow-300">
              <tr>
                <th className="px-4 py-3 font-black uppercase">Name</th>
                <th className="px-4 py-3 font-black uppercase">Email</th>
                <th className="px-4 py-3 font-black uppercase">Phone</th>
                <th className="px-4 py-3 font-black uppercase">Role</th>
                <th className="px-4 py-3 font-black uppercase">Status</th>
                <th className="px-4 py-3 font-black uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-zinc-200 last:border-b-0 hover:bg-orange-50">
                  <td className="px-4 py-3 font-bold">{s.name}</td>
                  <td className="px-4 py-3 font-bold">{s.email}</td>
                  <td className="px-4 py-3 font-bold">{s.phoneNumber}</td>
                  <td className="px-4 py-3 font-bold capitalize">{s.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block border-2 border-black px-2 py-0.5 text-xs font-black ${s.isActive ? "bg-green-300" : "bg-red-300"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="border-2 border-black bg-blue-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        title="Edit"
                      >
                        <PencilSimple size={14} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`border-2 border-black p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${s.isActive ? "bg-red-200" : "bg-green-200"}`}
                        title={s.isActive ? "Deactivate" : "Activate"}
                      >
                        {s.isActive ? <Trash size={14} weight="bold" /> : <Check size={14} weight="bold" />}
                      </button>
                      <button
                        onClick={() => openPassword(s)}
                        className="border-2 border-black bg-yellow-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        title="Change Password"
                      >
                        <Key size={14} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CaretLeft size={14} weight="bold" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black font-[family-name:var(--font-bricolage)] uppercase">
                {modalMode === "create" && "Add Staff"}
                {modalMode === "edit" && "Edit Staff"}
                {modalMode === "password" && "Change Password"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X size={20} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode === "password" ? (
                <>
                  <p className="text-sm font-bold">Changing password for: {form.name}</p>
                  <div>
                    <label className="mb-1 block text-sm font-bold">New Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                      required
                      minLength={8}
                    />
                    {formErrors.password && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.password[0]}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-bold">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                      required
                    />
                    {formErrors.name && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.name[0]}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                      required
                    />
                    {formErrors.email && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.email[0]}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold">Phone Number</label>
                    <input
                      type="text"
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                      required
                    />
                    {formErrors.phoneNumber && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.phoneNumber[0]}</p>}
                  </div>
                  {modalMode === "create" && (
                    <div>
                      <label className="mb-1 block text-sm font-bold">Password</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                        required
                        minLength={8}
                      />
                      {formErrors.password && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.password[0]}</p>}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : modalMode === "password" ? "Change Password" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
