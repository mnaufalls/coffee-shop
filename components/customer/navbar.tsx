"use client";

import { useState } from "react";
import Link from "next/link";
import {
  House,
  ShoppingBag,
  UserCircle,
  List,
  X,
  ArrowRight,
} from "@phosphor-icons/react";

import { useCartStore } from "@/store/cart-store";

export default function CustomerNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold tracking-tight sm:text-2xl"
        >
          COFFEE<span className="text-orange-500">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            <House size={18} weight="bold" />
            Home
          </Link>

          <Link
            href="/menu"
            className="flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            <ShoppingBag size={18} weight="bold" />
            Menu
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            onClick={closeMobileMenu}
            className="relative flex h-10 w-10 items-center justify-center border-2 border-black bg-yellow-300 shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <ShoppingBag size={21} weight="bold" />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center border-2 border-black bg-pink-300 px-1 text-xs font-black">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            aria-label="Profile"
            onClick={closeMobileMenu}
            className="hidden h-10 w-10 items-center justify-center border-2 border-black bg-pink-300 shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:flex"
          >
            <UserCircle size={21} weight="bold" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={21} weight="bold" />
            ) : (
              <List size={21} weight="bold" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t-2 border-black bg-[#f5f0e8] transition-all duration-200 md:hidden ${
          mobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="grid gap-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center justify-between border-2 border-black bg-white px-4 py-3 font-[family-name:var(--font-dm-sans)] font-bold shadow-[4px_4px_0_0_#000] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <span className="flex items-center gap-3">
                <House size={20} weight="bold" />
                Home
              </span>

              <ArrowRight size={20} weight="bold" />
            </Link>

            <Link
              href="/menu"
              onClick={closeMobileMenu}
              className="flex items-center justify-between border-2 border-black bg-yellow-300 px-4 py-3 font-[family-name:var(--font-dm-sans)] font-bold shadow-[4px_4px_0_0_#000] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={20} weight="bold" />
                Menu
              </span>

              <ArrowRight size={20} weight="bold" />
            </Link>

            <Link
              href="/profile"
              onClick={closeMobileMenu}
              className="flex items-center justify-between border-2 border-black bg-pink-300 px-4 py-3 font-[family-name:var(--font-dm-sans)] font-bold shadow-[4px_4px_0_0_#000] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <span className="flex items-center gap-3">
                <UserCircle size={20} weight="bold" />
                Profile
              </span>

              <ArrowRight size={20} weight="bold" />
            </Link>

            <Link
              href="/cart"
              onClick={closeMobileMenu}
              className="flex items-center justify-between border-2 border-black bg-white px-4 py-3 font-[family-name:var(--font-dm-sans)] font-bold shadow-[4px_4px_0_0_#000] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={20} weight="bold" />
                Cart
              </span>

              {cartCount > 0 && (
                <span className="border-2 border-black bg-pink-300 px-2 py-0.5 text-xs font-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}