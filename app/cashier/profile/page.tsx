"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileCard from "@/components/cashier/profile-card";

type CashierProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

export default function CashierProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<CashierProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ?? "Failed to load profile",
          );
        }

        setUser(result.data.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <p className="font-bold">Loading profile...</p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="border-2 border-black bg-red-300 p-4 font-bold">
          {error || "Profile not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide">
          Coffee Shop
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Profile
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Manage your cashier account information.
        </p>
      </header>

      <ProfileCard user={user} />

      <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]">
        <h2 className="text-xl font-black">
          Account Actions
        </h2>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 border-2 border-black bg-red-300 px-5 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Logout
        </button>
      </section>
    </main>
  );
}