"use client";

import { useEffect, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { CategorySection } from "@/components/products/CategorySection";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  isAvailable: boolean;
  imageUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
};

type Category = {
  id: string;
  name: string;
};

export default function CashierProductsPage() {
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    quickStockUpdate,
    toggleAvailability,
    uploadImage,
    setError: setProductsError,
  } = useProducts();

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setError: setCategoriesError,
  } = useCategories();

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productImage, setProductImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "product" | "category";
    id: string;
    name: string;
  } | null>(null);

  const isLoading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  function openAddProduct() {
    setEditingProduct(null);
    setProductName("");
    setProductDesc("");
    setProductPrice("");
    setProductStock("");
    setProductCategoryId(categories[0]?.id ?? "");
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

  async function handleImageUpload(file: File): Promise<string | null> {
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      return url;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveProduct() {
    setIsSaving(true);
    try {
      const priceNum = Number(productPrice);
      const stockNum = Number(productStock);

      if (isNaN(priceNum) || priceNum <= 0) {
        setProductsError("Price must be a positive number");
        return;
      }

      if (isNaN(stockNum) || stockNum < 0) {
        setProductsError("Stock must be a non-negative number");
        return;
      }

      const data = {
        name: productName,
        description: productDesc,
        price: priceNum,
        stock: stockNum,
        categoryId: productCategoryId,
        imageUrl: productImage || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      setShowProductModal(false);
    } catch {
      // error sudah di-handle oleh hook
    } finally {
      setIsSaving(false);
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
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName);
      } else {
        await createCategory(categoryName);
      }
      setShowCategoryModal(false);
    } catch {
      // error sudah di-handle oleh hook
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    await deleteCategory(id);
    setDeleteConfirm(null);
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function handleDeleteProduct(id: string) {
    deleteProduct(id);
    setDeleteConfirm(null);
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
        <p className="text-sm font-bold uppercase tracking-wide">Coffee Shop</p>
        <h1 className="mt-2 text-3xl font-black">Products & Categories</h1>
        <p className="mt-2 text-sm text-zinc-600">Manage products, stock, and categories.</p>
      </header>

      {error && (
        <div className="flex items-center gap-2 border-2 border-black bg-red-300 p-4 text-sm font-bold">
          <WarningCircle size={20} weight="bold" />
          {error}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black">Products</h2>
          <button
            type="button"
            onClick={openAddProduct}
            className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Add Product
          </button>
        </div>

        <ProductTable
          products={products}
          onEdit={openEditProduct}
          onDelete={(id, name) => setDeleteConfirm({ type: "product", id, name })}
          onToggleAvailability={toggleAvailability}
          onQuickStockUpdate={quickStockUpdate}
          formatRupiah={formatRupiah}
        />
      </section>

      <CategorySection
        categories={categories}
        onAdd={openAddCategory}
        onEdit={openEditCategory}
        onDelete={(id, name) => setDeleteConfirm({ type: "category", id, name })}
      />

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        editingProduct={editingProduct}
        productName={productName}
        setProductName={setProductName}
        productDesc={productDesc}
        setProductDesc={setProductDesc}
        productPrice={productPrice}
        setProductPrice={setProductPrice}
        productStock={productStock}
        setProductStock={setProductStock}
        productCategoryId={productCategoryId}
        setProductCategoryId={setProductCategoryId}
        productImage={productImage}
        setProductImage={setProductImage}
        isUploading={isUploading}
        isSaving={isSaving}
        categories={categories}
        onSave={handleSaveProduct}
        onUpload={handleImageUpload}
      />

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
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="border-2 border-black bg-zinc-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={isSavingCategory || !categoryName}
                className="w-full border-2 border-black bg-yellow-300 px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCategory ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
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
            <h3 className="mb-2 text-lg font-black">Delete {deleteConfirm.type}</h3>
            <p className="mb-4 text-sm font-bold">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
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
                  if (deleteConfirm.type === "product") {
                    handleDeleteProduct(deleteConfirm.id);
                  } else {
                    handleDeleteCategory(deleteConfirm.id);
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