import { useState } from "react";

export interface Staff {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadStaff(page: number, search: string) {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/staff?${params}`, { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to fetch staff");
      setStaff(json.data ?? []);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch staff");
    } finally {
      setIsLoading(false);
    }
  }

  async function createStaff(data: { name: string; email: string; phoneNumber: string; password: string }) {
    setError("");
    setSuccess("");
    const res = await fetch("/api/staff", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role: "admin" }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      if (json.errors) throw json.errors;
      throw new Error(json.message ?? "Failed to create staff");
    }
    setSuccess("Staff created successfully");
    return json;
  }

  async function updateStaff(id: string, data: { name: string; email: string; phoneNumber: string }) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/staff/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      if (json.errors) throw json.errors;
      throw new Error(json.message ?? "Failed to update staff");
    }
    setSuccess("Staff updated successfully");
    return json;
  }

  async function toggleActive(id: string, current: boolean) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/staff/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to update staff");
    setSuccess(`Staff ${current ? "deactivated" : "activated"} successfully`);
    return json;
  }

  async function changePassword(id: string, password: string) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/staff/${id}/password`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      if (json.errors) throw json.errors;
      throw new Error(json.message ?? "Failed to change password");
    }
    setSuccess("Password changed successfully");
    return json;
  }

  return {
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
  };
}