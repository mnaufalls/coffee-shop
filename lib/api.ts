import type { Category, Product } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/api/categories`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch categories");
  const result: { data: Category[] } = await response.json();
  return result.data;
}

export async function getProducts(search?: string, categoryId?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("categoryId", categoryId);
  const query = params.toString();
  const response = await fetch(`${BASE_URL}/api/products${query ? `?${query}` : ""}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch products");
  const result: { data: Product[] } = await response.json();
  return result.data;
}

export async function getProduct(id: string): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/api/products/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  const result: { data: { product: Product } } = await response.json();
  return result.data.product;
}