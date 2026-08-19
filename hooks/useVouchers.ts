"use client";

import { useState } from "react";

export interface Voucher {
  id: string;
  code: string;
  discountAmount: string;
  usageLimit: number;
  usageCount: number;
  minPurchaseAmount: string;
  isActive: boolean;
  createdAt: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadVouchers(page: number, search: string) {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/vouchers?${params}`, { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to fetch vouchers");
      setVouchers(json.data ?? []);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vouchers");
    } finally {
      setIsLoading(false);
    }
  }

  async function createVoucher(data: {
    code: string;
    discountAmount: number;
    usageLimit: number;
    minPurchaseAmount: number;
    isActive: boolean;
  }) {
    setError("");
    setSuccess("");
    const res = await fetch("/api/vouchers", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      if (json.errors) throw json.errors;
      throw new Error(json.message ?? "Failed to create voucher");
    }
    setSuccess("Voucher created successfully");
    return json;
  }

  async function updateVoucher(
    id: string,
    data: {
      code: string;
      discountAmount: number;
      usageLimit: number;
      minPurchaseAmount: number;
      isActive: boolean;
    }
  ) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/vouchers/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      if (json.errors) throw json.errors;
      throw new Error(json.message ?? "Failed to update voucher");
    }
    setSuccess("Voucher updated successfully");
    return json;
  }

  async function toggleActive(id: string, current: boolean) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/vouchers/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to update voucher");
    setSuccess(`Voucher ${current ? "deactivated" : "activated"}`);
    return json;
  }

  async function deleteVoucher(id: string) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/vouchers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to delete voucher");
    setSuccess("Voucher deleted successfully");
    return json;
  }

  return {
    vouchers,
    meta,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    loadVouchers,
    createVoucher,
    updateVoucher,
    toggleActive,
    deleteVoucher,
  };
}