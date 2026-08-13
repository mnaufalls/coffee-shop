import { cookies } from "next/headers";

import {
  AccessTokenPayload,
  verifyAccessToken,
} from "@/lib/auth/jwt";

export async function getCurrentUser():
  Promise<AccessTokenPayload | null> {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    return verifyAccessToken(token);
  } catch {
    return null;
  }
}