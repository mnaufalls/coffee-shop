"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  PencilSimple,
  TrashSimple,
  X,
  WarningCircle,
} from "@phosphor-icons/react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
};

type Category = {
  id: string;
  name: string;
};

export default function CashierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    Category[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showProductModal, setShowProductModal] =
    useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCategoryId, setProductCategoryId] =
    useState("");
  const [productImage, setProductImage] =
    useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] =
    useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "product" | "category";
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?limit=9999", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/categories", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const prodResult = await prodRes.json();
      const catResult = await catRes.json();

      if (prodResult.success)
        setProducts(prodResult.data.products);
      if (catResult.success)
        setCategories(catResult.data.categories);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  function openAddProduct() {
    setEditingProduct(null);
    setProductName("");
    setProductDesc("");
    setProductPrice("");
    setProductStock("");
    setProductCategoryId(
      categories[0]?.id ?? "",
    );
    setProductImage("");
    setShowProductModal(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDesc(product.description);
    setProductPrice(String(product.price));
    setProductStock(String(product.stock));
    setProductCategoryId(product.categoryId);
    setProductImage(product.imageUrl ?? "");
    setShowProductModal(true);
  }

  async function handleImageUpload(
    file: File,
  ): Promise<string | null> {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ?? "Upload failed",
        );
      }

      return result.data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed",
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveProduct() {
    setIsSaving(true);
    setError("");

    try {
      const body = {
        name: productName,
        description: productDesc,
        price: Number(productPrice),
        stock: Number(productStock),
        categoryId: productCategoryId,
        imageUrl: productImage || undefined,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to save product",
        );
      }

      setShowProductModal(false);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuickStockUpdate(
    productId: string,
    newStock: number,
  ) {
    try {
      const res = await fetch(
        `/api/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ stock: newStock }),
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to update stock",
        );
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: newStock }
            : p,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update stock",
      );
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to delete product",
        );
      }

      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product",
      );
    }
  }

  function openAddCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setShowCategoryModal(true);
  }

  function openEditCategory(cat: Category) {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setShowCategoryModal(true);
  }

  async function handleSaveCategory() {
    setIsSavingCategory(true);
    setError("");

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";

      const method = editingCategory
        ? "PATCH"
        : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: categoryName }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to save category",
        );
      }

      setShowCategoryModal(false);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category",
      );
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      const res = await fetch(
        `/api/categories/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ??
            "Failed to delete category",
        );
      }

      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category",
      );
    }
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <p className="font-bold">Loading products...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide">
          Coffee Shop
        </p>
        <h1 className="mt-2 text-3xl font-black">
          Products & Categories
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage products, stock, and categories.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-2 border-2 border-black bg-red-300 p-4 text-sm font-bold">
          <WarningCircle size={20} weight="bold" />
          {error}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black">
            Products
          </h2>
          <button
            type="button"
            onClick={openAddProduct}
            className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <Plus size={18} weight="bold" />
            Add Product
          </button>
        </div>

        <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-zinc-100">
                <th className="p-3 text-left font-black uppercase">
                  Image
                </th>
                <th className="p-3 text-left font-black uppercase">
                  Name
                </th>
                <th className="p-3 text-left font-black uppercase">
                  Category
                </th>
                <th className="p-3 text-left font-black uppercase">
                  Price
                </th>
                <th className="p-3 text-left font-black uppercase">
                  Stock
                </th>
                <th className="p-3 text-left font-black uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-200"
                >
                  <td className="p-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 border border-black object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center border border-black bg-zinc-100 text-[10px] font-bold">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-bold">
                    {product.name}
                  </td>
                  <td className="p-3">
                    <span className="border border-black bg-zinc-100 px-2 py-1 text-xs font-bold">
                      {product.category?.name ??
                        "Uncategorized"}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    {formatRupiah(
                      Number(product.price),
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        defaultValue={product.stock}
                        key={product.stock}
                        onBlur={(e) => {
                          const val = Number(
                            e.target.value,
                          );
                          if (val !== product.stock) {
                            handleQuickStockUpdate(
                              product.id,
                              val,
                            );
                          }
                        }}
                        className="w-20 border-2 border-black bg-white px-2 py-1 text-sm font-bold outline-none focus:bg-orange-50"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditProduct(product)
                        }
                        className="border-2 border-black bg-blue-200 p-2 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                      >
                        <PencilSimple
                          size={14}
                          weight="bold"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "product",
                            id: product.id,
                            name: product.name,
                          })
                        }
                        className="border-2 border-black bg-red-300 p-2 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                      >
                        <TrashSimple
                          size={14}
                          weight="bold"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center font-bold"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black">
            Categories
          </h2>
          <button
            type="button"
            onClick={openAddCategory}
            className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <Plus size={18} weight="bold" />
            Add Category
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[3px_3px_0_0_#000]"
            >
              <span className="font-black">
                {cat.name}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openEditCategory(cat)
                  }
                  className="border-2 border-black bg-blue-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <PencilSimple
                    size={12}
                    weight="bold"
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirm({
                      type: "category",
                      id: cat.id,
                      name: cat.name,
                    })
                  }
                  className="border-2 border-black bg-red-300 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <TrashSimple
                    size={12}
                    weight="bold"
                  />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
              <p className="font-bold">
                No categories found.
              </p>
            </div>
          )}
        </div>
      </section>

      {showProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowProductModal(false)}
        >
          <div
            className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black">
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setShowProductModal(false)
                }
                className="border-2 border-black bg-zinc-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase">
                  Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase">
                  Description
                </label>
                <textarea
                  value={productDesc}
                  onChange={(e) =>
                    setProductDesc(e.target.value)
                  }
                  rows={3}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase">
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productPrice}
                    onChange={(e) =>
                      setProductPrice(e.target.value)
                    }
                    className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase">
                    Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productStock}
                    onChange={(e) =>
                      setProductStock(e.target.value)
                    }
                    className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase">
                  Category
                </label>
                <select
                  value={productCategoryId}
                  onChange={(e) =>
                    setProductCategoryId(
                      e.target.value,
                    )
                  }
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                >
                  <option value="">
                    Select category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase">
                  Image (.webp)
                </label>
                <input
                  type="file"
                  accept=".webp"
                  onChange={async (e) => {
                    const file =
                      e.target.files?.[0];
                    if (file) {
                      const url =
                        await handleImageUpload(
                          file,
                        );
                      if (url) setProductImage(url);
                    }
                  }}
                  disabled={isUploading}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none file:mr-3 file:border-0 file:bg-zinc-200 file:px-3 file:py-1 file:text-xs file:font-black file:border-r-2 file:border-black disabled:opacity-50"
                />
                {isUploading && (
                  <p className="mt-1 text-xs font-bold text-blue-600">
                    Uploading...
                  </p>
                )}
                {productImage && (
                  <img
                    src={productImage}
                    alt="Preview"
                    className="mt-2 h-16 border border-black object-cover"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={
                  isSaving ||
                  isUploading ||
                  !productName ||
                  !productPrice ||
                  !productCategoryId
                }
                className="w-full border-2 border-black bg-yellow-300 px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black">
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setShowCategoryModal(false)
                }
                className="border-2 border-black bg-zinc-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={
                  isSavingCategory || !categoryName
                }
                className="w-full border-2 border-black bg-yellow-300 px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCategory
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-black">
              Delete {deleteConfirm.type}
            </h3>
            <p className="mb-4 text-sm font-bold">
              Are you sure you want to delete &quot;
              {deleteConfirm.name}&quot;? This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    deleteConfirm.type === "product"
                  ) {
                    handleDeleteProduct(
                      deleteConfirm.id,
                    );
                  } else {
                    handleDeleteCategory(
                      deleteConfirm.id,
                    );
                  }
                }}
                className="flex-1 border-2 border-black bg-red-300 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
