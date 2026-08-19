"use client";

import { useEffect, useState } from "react";
import { Users, Plus, MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useStaff, type Staff } from "@/hooks/useStaff";
import { StaffTable } from "@/components/staff/StaffTable";
import { StaffModal } from "@/components/staff/StaffModal";

const emptyForm = { name: "", email: "", phoneNumber: "", password: "" };

export default function OwnerStaffPage() {
  const {
    staff,
    meta,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    loadStaff,
    createStaff,
    updateStaff,
    toggleActive,
    changePassword,
  } = useStaff();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "password">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStaff(page, search);
  }, [page, search]);

  function openCreate() {
    setModalMode("create");
    setEditingId(null);
    setEditingName("");
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(s: Staff) {
    setModalMode("edit");
    setEditingId(s.id);
    setEditingName(s.name);
    setForm({ name: s.name, email: s.email, phoneNumber: s.phoneNumber, password: "" });
    setFormErrors({});
    setShowModal(true);
  }

  function openPassword(s: Staff) {
    setModalMode("password");
    setEditingId(s.id);
    setEditingName(s.name);
    setForm({ ...emptyForm, name: s.name });
    setFormErrors({});
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setError("");
    setSuccess("");

    try {
      if (modalMode === "create") {
        await createStaff(form);
        setShowModal(false);
        setPage(1);
        loadStaff(page, search);
      } else if (modalMode === "edit" && editingId) {
        await updateStaff(editingId, { name: form.name, email: form.email, phoneNumber: form.phoneNumber });
        setShowModal(false);
        loadStaff(page, search);
      } else if (modalMode === "password" && editingId) {
        await changePassword(editingId, form.password);
        setShowModal(false);
      }
    } catch (err: any) {
      if (typeof err === "object" && err !== null) {
        setFormErrors(err);
      } else {
        setError(err instanceof Error ? err.message : "Operation failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(s: Staff) {
    if (!confirm(`Are you sure you want to ${s.isActive ? "deactivate" : "activate"} ${s.name}?`)) return;
    await toggleActive(s.id, s.isActive);
    loadStaff(page, search);
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
      ) : (
        <StaffTable
          staff={staff}
          onEdit={openEdit}
          onToggleActive={handleToggleActive}
          onPassword={openPassword}
        />
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

      <StaffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        editingName={editingName}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </main>
  );
}