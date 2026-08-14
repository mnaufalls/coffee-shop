"use client";

import Link from "next/link";
import {
  House,
  ShoppingBag,
  UserCircle,
  List,
} from "@phosphor-icons/react";
import { useCartStore } from "@/store/cart-store";

export default function CustomerNavbar() {
  const items = useCartStore((state) => state.items);

const cartCount = items.reduce(
  (total, item) => total + item.quantity,
  0,
);
  return (
    <header className="sticky top-0 z-50 border-b border-black bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-black tracking-tight"
        >
          COFFEE<span className="text-orange-500">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            <House size={18} weight="bold" />
            Home
          </Link>

          <Link
            href="/menu"
            className="flex items-center gap-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            <ShoppingBag size={18} weight="bold" />
            Menu
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
  href="/cart"
  aria-label={`Shopping cart with ${cartCount} items`}
  className="relative flex h-10 w-10 items-center justify-center border-2 border-black bg-yellow-300 shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
>
  <ShoppingBag size={21} weight="bold" />

  {cartCount > 0 && (
    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center border-2 border-black bg-pink-300 px-1 text-xs font-black">
      {cartCount > 99 ? "99+" : cartCount}
    </span>
  )}
</Link>

          <Link
            href="/profile"
            aria-label="Profile"
            className="hidden h-10 w-10 items-center justify-center border-2 border-black bg-pink-300 shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:flex"
          >
            <UserCircle size={21} weight="bold" />
          </Link>

          {/* Mobile menu placeholder */}
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none md:hidden"
          >
            <List size={21} weight="bold" />
          </button>
        </div>
      </div>
    </header>
  );
}