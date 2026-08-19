import { useState } from "react";
import type { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await res.json();
      if (result.data) setCategories(result.data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  async function createCategory(name: string) {
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to create category");
      await loadCategories();
      return result.data.category;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
      throw err;
    }
  }

  async function updateCategory(id: string, name: string) {
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to update category");
      await loadCategories();
      return result.data.category;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
      throw err;
    }
  }

  async function deleteCategory(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to delete category");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
      throw err;
    }
  }

  return {
    categories,
    isLoading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setError,
  };
}