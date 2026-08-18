"use client";

import Link from "next/link";
import {
  ChartBar,
  ClipboardText,
  Package,
  UserCircle,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/cashier", label: "Dashboard", icon: ChartBar },
  { href: "/cashier/products", label: "Products", icon: Package },
  { href: "/cashier/orders", label: "Orders", icon: ClipboardText },
  { href: "/cashier/profile", label: "Profile", icon: UserCircle },
];

export default function CashierNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/cashier"
          className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold tracking-tight"
        >
          COFFEE<span className="text-orange-500">.</span>
          <span className="ml-2 text-sm">CASHIER</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-bold transition-transform hover:-translate-y-0.5"
              >
                <Icon size={18} weight="bold" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
