"use client";

import { useState } from "react";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export interface Favorite {
  productId: string;
  productName: string;
  totalQuantity: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    setIsLoading(true);
    setError(null);
    try {
      const [profileResponse, favoritesResponse] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetch("/api/orders/favorites", { cache: "no-store" }),
      ]);

      const profileResult = await profileResponse.json();
      const favoritesResult = await favoritesResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileResult.message ?? "Failed to load profile");
      }

      setProfile(profileResult.data.user);
      if (favoritesResponse.ok) {
        setFavorites(favoritesResult.data.favorites);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const response = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to change password");
    }
    return result.message ?? "Password changed successfully";
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
  }

  return {
    profile,
    favorites,
    isLoading,
    error,
    loadProfile,
    changePassword,
    logout,
  };
}