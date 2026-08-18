"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChartBar,
  ClipboardText,
  Users,
  Tag,
  SignOut,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/owner", label: "Dashboard", icon: ChartBar },
  { href: "/owner/orders", label: "Orders", icon: ClipboardText },
  { href: "/owner/staff", label: "Staff", icon: Users },
  { href: "/owner/discount", label: "Discount", icon: Tag },
];

export default function OwnerNavbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/owner"
          className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold tracking-tight"
        >
          COFFEE<span className="text-orange-500">.</span>
          <span className="ml-2 text-sm">OWNER</span>
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

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 border-2 border-black bg-red-300 px-3 py-1.5 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SignOut size={16} weight="bold" />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </nav>
      </div>
    </header>
  );
}
