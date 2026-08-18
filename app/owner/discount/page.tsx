"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  PencilSimple,
  Trash,
  CaretLeft,
  CaretRight,
  X,
  MagnifyingGlass,
} from "@phosphor-icons/react";

interface Voucher {
  id: string;
  code: string;
  discountAmount: string;
  usageLimit: number;
  usageCount: number;
  minPurchaseAmount: string;
  isActive: boolean;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const emptyForm = {
  code: "",
  discountAmount: "",
  usageLimit: "",
  minPurchaseAmount: "",
  isActive: true,
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OwnerDiscountPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVouchers() {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page: String(page), limit: "10" });
        if (search) params.set("search", search);
        const res = await fetch(`/api/vouchers?${params}`, { credentials: "include", cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to fetch vouchers");
        setVouchers(json.data.vouchers ?? []);
        setMeta(json.data.meta);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch vouchers");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadVouchers();
    return () => { cancelled = true; };
  }, [page, search, refreshKey]);

  function openCreate() {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(v: Voucher) {
    setModalMode("edit");
    setEditingId(v.id);
    setForm({
      code: v.code,
      discountAmount: String(v.discountAmount),
      usageLimit: String(v.usageLimit),
      minPurchaseAmount: String(v.minPurchaseAmount),
      isActive: v.isActive,
    });
    setFormErrors({});
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setSuccess("");

    const body = {
      code: form.code,
      discountAmount: Number(form.discountAmount),
      usageLimit: Number(form.usageLimit),
      minPurchaseAmount: Number(form.minPurchaseAmount) || 0,
      isActive: form.isActive,
    };

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/vouchers", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (json.errors) setFormErrors(json.errors);
          throw new Error(json.message ?? "Failed to create voucher");
        }
        setSuccess("Voucher created successfully");
        setShowModal(false);
        setRefreshKey((k) => k + 1);
      } else if (editingId) {
        const res = await fetch(`/api/vouchers/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (json.errors) setFormErrors(json.errors);
          throw new Error(json.message ?? "Failed to update voucher");
        }
        setSuccess("Voucher updated successfully");
        setShowModal(false);
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(v: Voucher) {
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/vouchers/${v.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to update voucher");
      setSuccess(`Voucher ${v.isActive ? "deactivated" : "activated"}`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  }

  async function handleDelete(v: Voucher) {
    if (!confirm(`Delete voucher "${v.code}"? This cannot be undone.`)) return;
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/vouchers/${v.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to delete voucher");
      setSuccess("Voucher deleted successfully");
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
            <Tag size={28} weight="bold" />
            <h1 className="text-3xl font-black font-[family-name:var(--font-bricolage)] uppercase">Discount</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-600">Manage vouchers and discounts.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <Plus size={16} weight="bold" />
          Add Voucher
        </button>
      </header>

      {error && <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">{error}</div>}
      {success && <div className="border-2 border-black bg-green-300 p-4 text-sm font-bold">{success}</div>}

      <div className="relative max-w-sm">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search vouchers..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full border-2 border-black bg-white py-2 pl-9 pr-4 text-sm font-bold outline-none focus:bg-orange-50"
        />
      </div>

      {isLoading ? (
        <p className="font-bold">Loading vouchers...</p>
      ) : vouchers.length === 0 ? (
        <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
          <p className="font-bold">No vouchers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-black bg-yellow-300">
              <tr>
                <th className="px-4 py-3 font-black uppercase">Code</th>
                <th className="px-4 py-3 font-black uppercase">Discount</th>
                <th className="px-4 py-3 font-black uppercase">Min Purchase</th>
                <th className="px-4 py-3 font-black uppercase">Usage</th>
                <th className="px-4 py-3 font-black uppercase">Status</th>
                <th className="px-4 py-3 font-black uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-b border-zinc-200 last:border-b-0 hover:bg-orange-50">
                  <td className="px-4 py-3 font-black">{v.code}</td>
                  <td className="px-4 py-3 font-bold">{formatRupiah(Number(v.discountAmount))}</td>
                  <td className="px-4 py-3 font-bold">{formatRupiah(Number(v.minPurchaseAmount))}</td>
                  <td className="px-4 py-3 font-bold">{v.usageCount}/{v.usageLimit}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block border-2 border-black px-2 py-0.5 text-xs font-black ${v.isActive ? "bg-green-300" : "bg-red-300"}`}>
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="border-2 border-black bg-blue-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        title="Edit"
                      >
                        <PencilSimple size={14} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(v)}
                        className={`border-2 border-black p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${v.isActive ? "bg-orange-200" : "bg-green-200"}`}
                        title={v.isActive ? "Deactivate" : "Activate"}
                      >
                        <Tag size={14} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="border-2 border-black bg-red-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        title="Delete"
                      >
                        <Trash size={14} weight="bold" />
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
                {modalMode === "create" ? "Add Voucher" : "Edit Voucher"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X size={20} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold uppercase outline-none focus:bg-orange-50"
                  required
                />
                {formErrors.code && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.code[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Discount Amount (IDR)</label>
                <input
                  type="number"
                  value={form.discountAmount}
                  onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  required
                  min={1}
                />
                {formErrors.discountAmount && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.discountAmount[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Usage Limit</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  required
                  min={1}
                />
                {formErrors.usageLimit && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.usageLimit[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Min Purchase Amount (IDR)</label>
                <input
                  type="number"
                  value={form.minPurchaseAmount}
                  onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  min={0}
                />
                {formErrors.minPurchaseAmount && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.minPurchaseAmount[0]}</p>}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold">Active</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative h-6 w-11 border-2 border-black transition-colors ${form.isActive ? "bg-green-300" : "bg-zinc-300"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 border-2 border-black bg-white transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

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
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
