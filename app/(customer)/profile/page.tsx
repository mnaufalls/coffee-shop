"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwise } from "@phosphor-icons/react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { FavoritesCard } from "@/components/profile/FavoritesCard";
import { PasswordChangeCard } from "@/components/profile/PasswordChangeCard";
import { LogoutCard } from "@/components/profile/LogoutCard";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, favorites, isLoading, error, loadProfile, changePassword, logout } = useProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleChangePassword(event: React.FormEvent) {
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
      setPasswordError("New password must be at least 8 characters");
      setIsChangingPassword(false);
      return;
    }

    try {
      const message = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Unable to connect to the server. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
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
          <p className="font-black uppercase">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="page-container py-12">
        <div className="border-2 border-black bg-red-300 p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-black uppercase">{error ?? "Profile not found"}</p>
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
        <section>
          <p className="mb-3 text-sm font-black uppercase tracking-widest">Account</p>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">My Profile</h1>
        </section>

        <ProfileSummary profile={profile} />
        <FavoritesCard favorites={favorites} />

        <section className="grid gap-6 sm:grid-cols-2">
          <PasswordChangeCard
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isChangingPassword={isChangingPassword}
            passwordSuccess={passwordSuccess}
            passwordError={passwordError}
            onSubmit={handleChangePassword}
          />
          <LogoutCard isLoggingOut={isLoggingOut} onLogout={handleLogout} />
        </section>
      </div>
    </main>
  );
}