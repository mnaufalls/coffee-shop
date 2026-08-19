import { useState } from "react";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products?limit=9999", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await res.json();
      if (result.data) setProducts(result.data);
    } catch {
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }

  async function createProduct(data: Omit<Product, "id" | "category" | "isAvailable">) {
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to create product");
      await loadProducts();
      return result.data.product;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      throw err;
    }
  }

  async function updateProduct(id: string, data: Partial<Product>) {
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to update product");
      await loadProducts();
      return result.data.product;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err;
    }
  }

  async function deleteProduct(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to delete product");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    }
  }

  async function quickStockUpdate(id: string, newStock: number) {
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stock: newStock }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to update stock");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock");
      throw err;
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAvailable: !current }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Failed to update availability");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update availability");
      throw err;
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message ?? "Upload failed");
      return result.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    }
  }

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    quickStockUpdate,
    toggleAvailability,
    uploadImage,
    setError,
  };
}