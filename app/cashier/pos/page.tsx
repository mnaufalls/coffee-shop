"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  TrashSimple,
  ShoppingCart,
  CurrencyDollar,
  WarningCircle,
} from "@phosphor-icons/react";

type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  imageUrl: string | null;
  category: { id: string; name: string };
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Profile = {
  id: string;
  name: string;
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<
    "dine_in" | "takeaway"
  >("dine_in");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] =
    useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [prodRes, catRes, profRes] =
          await Promise.all([
            fetch("/api/products?limit=9999", {
              credentials: "include",
              cache: "no-store",
            }),
            fetch("/api/categories", {
              credentials: "include",
              cache: "no-store",
            }),
            fetch("/api/profile", {
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        const prodResult = await prodRes.json();
        const catResult = await catRes.json();
        const profResult = await profRes.json();

        if (cancelled) return;

        if (prodResult.success) {
          setProducts(prodResult.data.products);
        }
        if (catResult.success) {
          setCategories(catResult.data.categories);
        }
        if (profResult.success) {
          setProfile({
            id: profResult.data.user.id,
            name: profResult.data.user.name,
          });
        }
      } catch {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function addToCart(product: Product) {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find(
        (c) => c.product.id === product.id,
      );

      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.product.id !== productId) return c;
          const newQty = c.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > c.product.stock) return c;
          return { ...c, quantity: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function removeItem(productId: string) {
    setCart((prev) =>
      prev.filter((c) => c.product.id !== productId),
    );
  }

  const subtotal = cart.reduce(
    (sum, c) => sum + Number(c.product.price) * c.quantity,
    0,
  );

  const taxRate = 0.11;
  const taxAmount = Math.round(subtotal * taxRate);
  const total = Math.max(subtotal - discount + taxAmount, 0);

  async function validateVoucher() {
    if (!voucherCode.trim()) return;

    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: voucherCode.trim(),
          subtotal,
        }),
      });

      const result = await res.json();

      if (result.success && result.data.valid) {
        setDiscount(result.data.discount);
        setVoucherMessage("Voucher applied!");
      } else {
        setDiscount(0);
        setVoucherMessage(
          result.data?.message ?? "Invalid voucher",
        );
      }
    } catch {
      setVoucherMessage("Failed to validate voucher");
    }
  }

  async function placeOrder() {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderType,
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
          })),
          cashierId: profile?.id,
          cashierName: profile?.name,
          voucherCode: voucherCode.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to place order",
        );
      }

      setSuccess(
        `Order placed! ID: #${result.data.order.id.slice(-8).toUpperCase()}`,
      );
      setCart([]);
      setVoucherCode("");
      setDiscount(0);
      setVoucherMessage("");

      const prodRes = await fetch(
        "/api/products?limit=9999",
        {
          credentials: "include",
          cache: "no-store",
        },
      );
      const prodResult = await prodRes.json();
      if (prodResult.success) {
        setProducts(prodResult.data.products);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "all" ||
      p.category.id === selectedCategory;
    return matchSearch && matchCategory;
  });

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
        <p className="font-bold">Loading POS...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide">
          Coffee Shop
        </p>
        <h1 className="mt-2 text-3xl font-black">
          Point of Sale
        </h1>
      </header>

      {error && (
        <div className="mb-4 border-2 border-black bg-red-300 p-4 text-sm font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 border-2 border-black bg-green-300 p-4 text-sm font-bold">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
            />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="border-2 border-black bg-white p-3 text-left shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="mb-2 h-20 w-full object-cover border border-black"
                  />
                ) : (
                  <div className="mb-2 flex h-20 w-full items-center justify-center border border-black bg-zinc-100 text-xs font-bold">
                    No Image
                  </div>
                )}
                <p className="truncate text-sm font-black">
                  {product.name}
                </p>
                <p className="mt-1 text-xs font-bold text-orange-600">
                  {formatRupiah(Number(product.price))}
                </p>
                <p className="mt-1 text-xs font-bold text-zinc-500">
                  Stock: {product.stock}
                </p>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
                <p className="font-bold">
                  No products found.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000]">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingCart
                  size={22}
                  weight="bold"
                />
                <h2 className="text-lg font-black">
                  Cart
                </h2>
                <span className="ml-auto border-2 border-black bg-yellow-300 px-2 py-1 text-xs font-black">
                  {cart.reduce(
                    (s, c) => s + c.quantity,
                    0,
                  )}
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="py-6 text-center text-sm font-bold text-zinc-400">
                  No items in cart
                </p>
              ) : (
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 border-b border-zinc-200 pb-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-black">
                          {item.product.name}
                        </p>
                        <p className="text-xs font-bold text-orange-600">
                          {formatRupiah(
                            Number(item.product.price),
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(
                              item.product.id,
                              -1,
                            )
                          }
                          className="border border-black bg-zinc-200 p-1 transition-all hover:bg-zinc-300"
                        >
                          <Minus
                            size={12}
                            weight="bold"
                          />
                        </button>
                        <span className="w-6 text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(
                              item.product.id,
                              1,
                            )
                          }
                          disabled={
                            item.quantity >=
                            item.product.stock
                          }
                          className="border border-black bg-zinc-200 p-1 transition-all hover:bg-zinc-300 disabled:opacity-50"
                        >
                          <Plus
                            size={12}
                            weight="bold"
                          />
                        </button>
                      </div>

                      <p className="w-20 text-right text-xs font-bold">
                        {formatRupiah(
                          Number(item.product.price) *
                            item.quantity,
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.product.id)
                        }
                        className="text-red-500 transition-colors hover:text-red-700"
                      >
                        <TrashSimple
                          size={16}
                          weight="bold"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1 text-xs font-black uppercase">
                    Order Type
                  </p>
                  <div className="flex gap-2">
                    {(
                      ["dine_in", "takeaway"] as const
                    ).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setOrderType(type)
                        }
                        className={`flex-1 border-2 border-black px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_0_#000] transition-all ${
                          orderType === type
                            ? "bg-yellow-300"
                            : "bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                        }`}
                      >
                        {type === "dine_in"
                          ? "Dine In"
                          : "Takeaway"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-black uppercase">
                    Voucher Code
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value)
                      }
                      placeholder="Enter code"
                      className="flex-1 border-2 border-black bg-white px-3 py-2 text-sm font-medium outline-none focus:bg-orange-50"
                    />
                    <button
                      type="button"
                      onClick={validateVoucher}
                      className="border-2 border-black bg-white px-3 py-2 text-xs font-black shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                      Apply
                    </button>
                  </div>
                  {voucherMessage && (
                    <p
                      className={`mt-1 text-xs font-bold ${discount > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {voucherMessage}
                    </p>
                  )}
                </div>

                <div className="border-t-2 border-black pt-3 space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Subtotal</span>
                    <span>
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-green-600">
                      <span>Discount</span>
                      <span>
                        -{formatRupiah(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold">
                    <span>Tax (11%)</span>
                    <span>{formatRupiah(taxAmount)}</span>
                  </div>
                  <div className="border-t-2 border-black pt-2 flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span>{formatRupiah(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={
                    cart.length === 0 || isSubmitting
                  }
                  className="w-full border-2 border-black bg-yellow-300 px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Placing Order..."
                    : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
