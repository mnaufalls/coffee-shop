import Image from "next/image";
import { PencilSimple, TrashSimple, ToggleLeft, ToggleRight } from "@phosphor-icons/react";

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

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
  onQuickStockUpdate: (id: string, newStock: number) => void;
  formatRupiah: (value: number) => string;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleAvailability,
  onQuickStockUpdate,
  formatRupiah,
}: ProductTableProps) {
  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-black bg-zinc-100">
            <th className="p-3 text-left font-black uppercase">Image</th>
            <th className="p-3 text-left font-black uppercase">Name</th>
            <th className="p-3 text-left font-black uppercase">Category</th>
            <th className="p-3 text-left font-black uppercase">Price</th>
            <th className="p-3 text-left font-black uppercase">Stock</th>
            <th className="p-3 text-left font-black uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-zinc-200">
              <td className="p-3">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 border border-black object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center border border-black bg-zinc-100 text-[10px] font-bold">
                    N/A
                  </div>
                )}
              </td>
              <td className="p-3 font-bold">
                <div className="flex items-center gap-2">
                  {product.name}
                  {!product.isAvailable && (
                    <span className="border border-black bg-zinc-300 px-1.5 py-0.5 text-[10px] font-black uppercase">
                      Sold Out
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3">
                <span className="border border-black bg-zinc-100 px-2 py-1 text-xs font-bold">
                  {product.category?.name ?? "Uncategorized"}
                </span>
              </td>
              <td className="p-3 font-bold">{formatRupiah(Number(product.price))}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    defaultValue={product.stock}
                    key={product.stock}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== product.stock) {
                        onQuickStockUpdate(product.id, val);
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
                    onClick={() => onToggleAvailability(product.id, product.isAvailable)}
                    className={`border-2 border-black p-2 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
                      product.isAvailable ? "bg-green-300" : "bg-zinc-300"
                    }`}
                    title={product.isAvailable ? "Mark as sold out" : "Mark as available"}
                  >
                    {product.isAvailable ? (
                      <ToggleRight size={14} weight="bold" />
                    ) : (
                      <ToggleLeft size={14} weight="bold" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="border-2 border-black bg-blue-200 p-2 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  >
                    <PencilSimple size={14} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product.id, product.name)}
                    className="border-2 border-black bg-red-300 p-2 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  >
                    <TrashSimple size={14} weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center font-bold">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}