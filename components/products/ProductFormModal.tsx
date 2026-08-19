import Image from "next/image";
import { X } from "@phosphor-icons/react";

type Category = {
  id: string;
  name: string;
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: { id: string } | null;
  productName: string;
  setProductName: (val: string) => void;
  productDesc: string;
  setProductDesc: (val: string) => void;
  productPrice: string;
  setProductPrice: (val: string) => void;
  productStock: string;
  setProductStock: (val: string) => void;
  productCategoryId: string;
  setProductCategoryId: (val: string) => void;
  productImage: string;
  setProductImage: (val: string) => void;
  isUploading: boolean;
  isSaving: boolean;
  categories: Category[];
  onSave: () => void;
  onUpload: (file: File) => Promise<string | null>;
}

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  productName,
  setProductName,
  productDesc,
  setProductDesc,
  productPrice,
  setProductPrice,
  productStock,
  setProductStock,
  productCategoryId,
  setProductCategoryId,
  productImage,
  setProductImage,
  isUploading,
  isSaving,
  categories,
  onSave,
  onUpload,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-zinc-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-black uppercase">Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase">Description</label>
            <textarea
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              rows={3}
              className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-black uppercase">Price (IDR)</label>
              <input
                type="number"
                min={0}
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase">Stock</label>
              <input
                type="number"
                min={0}
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase">Category</label>
            <select
              value={productCategoryId}
              onChange={(e) => setProductCategoryId(e.target.value)}
              className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase">Image (.webp)</label>
            <input
              type="file"
              accept=".webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await onUpload(file);
                  if (url) setProductImage(url);
                }
              }}
              disabled={isUploading}
              className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none file:mr-3 file:border-0 file:bg-zinc-200 file:px-3 file:py-1 file:text-xs file:font-black file:border-r-2 file:border-black disabled:opacity-50"
            />
            {isUploading && (
              <p className="mt-1 text-xs font-bold text-blue-600">Uploading...</p>
            )}
            {productImage && (
              <Image
                src={productImage}
                alt="Preview"
                width={64}
                height={64}
                unoptimized
                className="mt-2 h-16 border border-black object-cover"
              />
            )}
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || isUploading || !productName || !productPrice || !productCategoryId}
            className="w-full border-2 border-black bg-yellow-300 px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}