"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise,
  Clock,
  Envelope,
  LockKey,
  Phone,
  Receipt,
  SignOut,
  Star,
  UserCircle,
} from "@phosphor-icons/react";

type Profile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

type Favorite = {
  productId: string;
  productName: string;
  totalQuantity: number;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(
    null,
  );
  const [favorites, setFavorites] = useState<Favorite[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<
    string | null
  >(null);
  const [passwordError, setPasswordError] = useState<
    string | null
  >(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [profileResponse, favoritesResponse] =
          await Promise.all([
            fetch("/api/profile", {
              cache: "no-store",
            }),
            fetch("/api/orders/favorites", {
              cache: "no-store",
            }),
          ]);

        const profileResult =
          await profileResponse.json();
        const favoritesResult =
          await favoritesResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileResult.message ??
              "Failed to load profile",
          );
        }

        setProfile(profileResult.data.user);

        if (favoritesResponse.ok) {
          setFavorites(favoritesResult.data.favorites);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load profile",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  async function handleChangePassword(
    event: React.FormEvent,
  ) {
    event.preventDefault();
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters",
      );
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/profile/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setPasswordError(
          result.message ?? "Failed to change password",
        );
        return;
      }

      setPasswordSuccess(
        result.message ?? "Password changed successfully",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page-container py-12">
        <div className="border-2 border-black bg-yellow-300 p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-black uppercase">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !profile) {
    return (
      <main className="page-container py-12">
        <div className="border-2 border-black bg-red-300 p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-black uppercase">
            {errorMessage ?? "Profile not found"}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 flex items-center gap-2 border-2 border-black bg-white px-4 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <ArrowClockwise size={20} weight="bold" />
            RETRY
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <section>
          <p className="mb-3 text-sm font-black uppercase tracking-widest">
            Account
          </p>

          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
            My Profile
          </h1>
        </section>

        {/* Profile Summary Card */}
        <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000] sm:flex sm:items-center sm:gap-8">
          <div className="mb-6 flex h-24 w-24 shrink-0 items-center justify-center border-2 border-black bg-orange-300 sm:mb-0 sm:h-32 sm:w-32">
            <UserCircle
              size={64}
              weight="bold"
              className="text-black"
            />
          </div>

          <div className="flex-grow text-center sm:text-left">
            <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-black uppercase sm:text-3xl">
              {profile.name}
            </h2>

            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase">
                {profile.role}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t-4 border-black pt-4 sm:grid-cols-3 text-left">
              <div>
                <p className="text-xs font-black uppercase text-orange-600">
                  Email
                </p>

                <p className="mt-1 break-all font-bold">
                  {profile.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-orange-600">
                  Phone
                </p>

                <p className="mt-1 font-bold">
                  {profile.phoneNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-orange-600">
                  Member Since
                </p>

                <p className="mt-1 font-bold">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Order History + Favorite Orders */}
        <section className="grid gap-6 sm:grid-cols-2">
          {/* Order History */}
          <Link
            href="/orders"
            className="flex flex-col items-center justify-center border-2 border-black bg-[#FF9100] p-6 text-center shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Receipt
              size={48}
              weight="bold"
              className="mb-4"
            />

            <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">
              Order History
            </h3>

            <p className="mt-2 text-sm font-bold text-zinc-700">
              View your past brews and favorites.
            </p>

            <span className="mt-6 inline-flex border-2 border-black bg-white px-6 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase text-sm">
              View History
            </span>
          </Link>

          {/* Favorite Orders */}
          <div className="border-2 border-black bg-yellow-300 p-6 shadow-[5px_5px_0_0_#000]">
            <div className="flex items-center gap-3 mb-4">
              <Star
                size={32}
                weight="fill"
                className="text-black"
              />
              <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">
                Favorites
              </h3>
            </div>

            {favorites.length === 0 ? (
              <p className="text-sm font-bold text-zinc-700">
                No favorites yet. Start ordering to see
                your top picks here!
              </p>
            ) : (
              <div className="space-y-2">
                {favorites.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between border-2 border-black bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-orange-300 text-xs font-black">
                        {idx + 1}
                      </span>

                      <span className="text-sm font-bold">
                        {item.productName}
                      </span>
                    </div>

                    <span className="text-xs font-black">
                      {item.totalQuantity}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Account Settings */}
        <section className="grid gap-6 sm:grid-cols-2">
          {/* Password Change */}
          <div className="border-2 border-black bg-pink-300 p-6 shadow-[5px_5px_0_0_#000]">
            <div className="flex items-center gap-3 mb-6">
              <LockKey size={32} weight="bold" />
              <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">
                Security
              </h3>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-zinc-700">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  required
                  className="w-full border-2 border-black bg-white p-3 font-bold outline-none focus:bg-orange-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-zinc-700">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                  minLength={8}
                  className="w-full border-2 border-black bg-white p-3 font-bold outline-none focus:bg-orange-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-zinc-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  minLength={8}
                  className="w-full border-2 border-black bg-white p-3 font-bold outline-none focus:bg-orange-50"
                />
              </div>

              {passwordSuccess && (
                <div className="border-2 border-black bg-green-300 p-3 text-sm font-bold">
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="border-2 border-black bg-red-300 p-3 text-sm font-bold">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="mt-2 flex w-full items-center justify-center gap-2 border-2 border-black bg-yellow-300 px-5 py-3 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 uppercase text-sm"
              >
                {isChangingPassword
                  ? "CHANGING..."
                  : "UPDATE PASSWORD"}
              </button>
            </form>
          </div>

          {/* Logout */}
          <div className="flex flex-col items-center justify-center border-2 border-black bg-red-300 p-6 text-center shadow-[5px_5px_0_0_#000]">
            <SignOut
              size={48}
              weight="bold"
              className="mb-4"
            />

            <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">
              Done for now?
            </h3>

            <p className="mt-2 text-sm font-bold text-zinc-700">
              Stay caffeinated out there.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-6 border-2 border-black bg-white px-8 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 uppercase text-sm"
            >
              {isLoggingOut
                ? "LOGGING OUT..."
                : "LOGOUT"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
